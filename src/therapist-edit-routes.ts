import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
}

const therapistEditApp = new Hono<{ Bindings: Bindings }>()

// ============================================
// Helper Functions
// ============================================

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}`

const canApprove = (userRole: string, therapistOfficeId: string | null, userOfficeId: string | null) => {
  // 総管理者は全てを承認可能
  if (userRole === 'ADMIN') return true
  
  // オフィス管理者は同じオフィスのセラピストのみ承認可能
  if (userRole === 'THERAPIST_OFFICE' && therapistOfficeId && userOfficeId === therapistOfficeId) {
    return true
  }
  
  return false
}

const logEdit = async (db: D1Database, data: {
  therapistId: string
  editorId: string
  editorName: string
  editorRole: string
  fieldName: string
  oldValue: string | null
  newValue: string
  editType: 'DIRECT' | 'APPROVED'
  approvalId?: string
}) => {
  await db.prepare(`
    INSERT INTO therapist_edit_logs (id, therapist_id, editor_id, editor_name, editor_role, field_name, old_value, new_value, edit_type, approval_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    generateId('log'),
    data.therapistId,
    data.editorId,
    data.editorName,
    data.editorRole,
    data.fieldName,
    data.oldValue,
    data.newValue,
    data.editType,
    data.approvalId || null
  ).run()
}

// ============================================
// POST /api/therapist-edits
// セラピスト情報編集リクエスト
// ============================================
therapistEditApp.post('/', async (c) => {
  try {
    const { therapistId, changes, editorId, editorRole } = await c.req.json()
    
    if (!c.env.DB) {
      return c.json({ error: 'Database not available' }, 503)
    }
    
    // セラピストプロファイル取得
    const { results: profiles } = await c.env.DB.prepare(`
      SELECT tp.*, u.name as therapist_name, tp.office_id
      FROM therapist_profiles tp
      JOIN users u ON tp.user_id = u.id
      WHERE tp.id = ?
    `).bind(therapistId).all()
    
    if (profiles.length === 0) {
      return c.json({ error: 'Therapist not found' }, 404)
    }
    
    const profile = profiles[0] as Record<string, unknown>
    
    // 編集者情報取得
    const { results: editors } = await c.env.DB.prepare(`
      SELECT id, name, role FROM users WHERE id = ?
    `).bind(editorId).all()
    
    if (editors.length === 0) {
      return c.json({ error: 'Editor not found' }, 404)
    }
    
    const editor = editors[0] as Record<string, unknown>
    
    // 権限チェック：本人編集 or 管理者編集
    const isSelfEdit = editorRole === 'THERAPIST' && profile.user_id === editorId
    const isAdminEdit = editorRole === 'ADMIN'
    const isOfficeAdminEdit = editorRole === 'THERAPIST_OFFICE'
    
    if (!isSelfEdit && !isAdminEdit && !isOfficeAdminEdit) {
      return c.json({ error: 'Unauthorized' }, 403)
    }
    
    // 本人編集の場合：承認待ちレコード作成
    if (isSelfEdit) {
      const editId = generateId('edit')
      
      await c.env.DB.prepare(`
        INSERT INTO therapist_profile_edits (id, therapist_id, editor_id, editor_role, changed_fields, status)
        VALUES (?, ?, ?, ?, ?, 'PENDING')
      `).bind(
        editId,
        therapistId,
        editorId,
        editorRole,
        JSON.stringify(changes)
      ).run()
      
      return c.json({ 
        success: true, 
        requiresApproval: true,
        editId,
        message: 'Edit submitted for approval'
      })
    }
    
    // 管理者編集の場合：即時反映 + ログ記録
    if (isAdminEdit || isOfficeAdminEdit) {
      // オフィス管理者の場合、同じオフィスかチェック
      if (isOfficeAdminEdit) {
        const { results: officeCheck } = await c.env.DB.prepare(`
          SELECT office_id FROM therapist_profiles WHERE user_id = ?
        `).bind(editorId).all()
        
        if (officeCheck.length === 0 || officeCheck[0].office_id !== profile.office_id) {
          return c.json({ error: 'Can only edit therapists in your office' }, 403)
        }
      }
      
      // 各フィールドを更新
      for (const [fieldName, newValue] of Object.entries(changes)) {
        const oldValue = profile[fieldName]
        
        // プロファイル更新
        await c.env.DB.prepare(`
          UPDATE therapist_profiles SET ${fieldName} = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
        `).bind(newValue, therapistId).run()
        
        // ログ記録
        await logEdit(c.env.DB, {
          therapistId,
          editorId,
          editorName: editor.name,
          editorRole,
          fieldName,
          oldValue: oldValue ? String(oldValue) : null,
          newValue: String(newValue),
          editType: 'DIRECT'
        })
      }
      
      return c.json({ 
        success: true, 
        requiresApproval: false,
        message: 'Profile updated immediately'
      })
    }
    
    return c.json({ error: 'Invalid request' }, 400)
  } catch (e) {
    console.error('Edit therapist profile error:', e)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// ============================================
// GET /api/therapist-edits/pending
// 承認待ちリスト取得（オフィス管理者・総管理者用）
// ============================================
therapistEditApp.get('/pending', async (c) => {
  try {
    const reviewerId = c.req.query('reviewer_id')
    const reviewerRole = c.req.query('reviewer_role')
    
    if (!c.env.DB) {
      return c.json({ error: 'Database not available' }, 503)
    }
    
    let query = `
      SELECT 
        tpe.*,
        u.name as therapist_name,
        tp.office_id,
        e.name as editor_name
      FROM therapist_profile_edits tpe
      JOIN therapist_profiles tp ON tpe.therapist_id = tp.id
      JOIN users u ON tp.user_id = u.id
      JOIN users e ON tpe.editor_id = e.id
      WHERE tpe.status = 'PENDING'
    `
    
    const params: (string | number | null)[] = []
    
    // オフィス管理者の場合、自分のオフィスのみ
    if (reviewerRole === 'THERAPIST_OFFICE') {
      const { results: officeCheck } = await c.env.DB.prepare(`
        SELECT office_id FROM therapist_profiles WHERE user_id = ?
      `).bind(reviewerId).all()
      
      if (officeCheck.length > 0 && officeCheck[0].office_id) {
        query += ' AND tp.office_id = ?'
        params.push(officeCheck[0].office_id)
      } else {
        return c.json([]) // オフィスに所属していない場合は空
      }
    }
    
    query += ' ORDER BY tpe.created_at DESC'
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all()
    
    return c.json(results)
  } catch (e) {
    console.error('Get pending edits error:', e)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// ============================================
// POST /api/therapist-edits/:id/approve
// 編集承認
// ============================================
therapistEditApp.post('/:id/approve', async (c) => {
  try {
    const editId = c.req.param('id')
    const { reviewerId, reviewerRole } = await c.req.json()
    
    if (!c.env.DB) {
      return c.json({ error: 'Database not available' }, 503)
    }
    
    // 編集リクエスト取得
    const { results: edits } = await c.env.DB.prepare(`
      SELECT tpe.*, tp.user_id, tp.office_id, u.name as therapist_name
      FROM therapist_profile_edits tpe
      JOIN therapist_profiles tp ON tpe.therapist_id = tp.id
      JOIN users u ON tp.user_id = u.id
      WHERE tpe.id = ? AND tpe.status = 'PENDING'
    `).bind(editId).all()
    
    if (edits.length === 0) {
      return c.json({ error: 'Edit request not found or already processed' }, 404)
    }
    
    const edit = edits[0] as Record<string, unknown>
    
    // 承認権限チェック
    const { results: officeData } = await c.env.DB.prepare(`
      SELECT office_id FROM therapist_profiles WHERE user_id = ?
    `).bind(reviewerId).all()
    
    const reviewerOfficeId = officeData.length > 0 ? officeData[0].office_id : null
    
    if (!canApprove(reviewerRole, edit.office_id, reviewerOfficeId)) {
      return c.json({ error: 'Unauthorized to approve this edit' }, 403)
    }
    
    // 承認者情報取得
    const { results: reviewers } = await c.env.DB.prepare(`
      SELECT name FROM users WHERE id = ?
    `).bind(reviewerId).all()
    
    const reviewerName = reviewers.length > 0 ? reviewers[0].name : 'Unknown'
    
    // 変更を適用
    const changes = JSON.parse(edit.changed_fields)
    
    // 現在の値を取得（ログ用）
    const { results: currentProfiles } = await c.env.DB.prepare(`
      SELECT * FROM therapist_profiles WHERE id = ?
    `).bind(edit.therapist_id).all()
    
    const currentProfile = currentProfiles[0] as Record<string, unknown>
    
    // 各フィールドを更新
    for (const [fieldName, newValue] of Object.entries(changes)) {
      const oldValue = currentProfile[fieldName]
      
      // プロファイル更新
      await c.env.DB.prepare(`
        UPDATE therapist_profiles SET ${fieldName} = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `).bind(newValue, edit.therapist_id).run()
      
      // ログ記録
      await logEdit(c.env.DB, {
        therapistId: edit.therapist_id,
        editorId: edit.editor_id,
        editorName: edit.editor_name || 'Unknown',
        editorRole: edit.editor_role,
        fieldName,
        oldValue: oldValue ? String(oldValue) : null,
        newValue: String(newValue),
        editType: 'APPROVED',
        approvalId: editId
      })
    }
    
    // 編集リクエストを承認済みに更新
    await c.env.DB.prepare(`
      UPDATE therapist_profile_edits 
      SET status = 'APPROVED', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(reviewerId, editId).run()
    
    return c.json({ 
      success: true,
      message: 'Edit approved and applied'
    })
  } catch (e) {
    console.error('Approve edit error:', e)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// ============================================
// POST /api/therapist-edits/:id/reject
// 編集却下
// ============================================
therapistEditApp.post('/:id/reject', async (c) => {
  try {
    const editId = c.req.param('id')
    const { reviewerId, reviewerRole, reason } = await c.req.json()
    
    if (!c.env.DB) {
      return c.json({ error: 'Database not available' }, 503)
    }
    
    // 編集リクエスト取得
    const { results: edits } = await c.env.DB.prepare(`
      SELECT tpe.*, tp.office_id
      FROM therapist_profile_edits tpe
      JOIN therapist_profiles tp ON tpe.therapist_id = tp.id
      WHERE tpe.id = ? AND tpe.status = 'PENDING'
    `).bind(editId).all()
    
    if (edits.length === 0) {
      return c.json({ error: 'Edit request not found or already processed' }, 404)
    }
    
    const edit = edits[0] as Record<string, unknown>
    
    // 承認権限チェック
    const { results: officeData } = await c.env.DB.prepare(`
      SELECT office_id FROM therapist_profiles WHERE user_id = ?
    `).bind(reviewerId).all()
    
    const reviewerOfficeId = officeData.length > 0 ? officeData[0].office_id : null
    
    if (!canApprove(reviewerRole, edit.office_id, reviewerOfficeId)) {
      return c.json({ error: 'Unauthorized to reject this edit' }, 403)
    }
    
    // 編集リクエストを却下に更新
    await c.env.DB.prepare(`
      UPDATE therapist_profile_edits 
      SET status = 'REJECTED', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, reject_reason = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(reviewerId, reason || 'No reason provided', editId).run()
    
    return c.json({ 
      success: true,
      message: 'Edit rejected'
    })
  } catch (e) {
    console.error('Reject edit error:', e)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// ============================================
// GET /api/therapist-edits/logs/:therapistId
// 編集ログ取得（全ユーザー閲覧可能）
// ============================================
therapistEditApp.get('/logs/:therapistId', async (c) => {
  try {
    const therapistId = c.req.param('therapistId')
    
    if (!c.env.DB) {
      return c.json({ error: 'Database not available' }, 503)
    }
    
    const { results } = await c.env.DB.prepare(`
      SELECT * FROM therapist_edit_logs
      WHERE therapist_id = ?
      ORDER BY created_at DESC
      LIMIT 100
    `).bind(therapistId).all()
    
    return c.json(results)
  } catch (e) {
    console.error('Get edit logs error:', e)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default therapistEditApp
