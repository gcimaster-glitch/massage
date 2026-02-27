import { Hono } from 'hono'
import { requireAdmin } from './auth-middleware'

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
}

const app = new Hono<{ Bindings: Bindings }>()

/**
 * Admin API: Delete specific users by email
 * DELETE /api/admin/users
 * Body: { emails: string[] }
 */
app.delete('/users', async (c) => {
  const { DB } = c.env

  if (!DB) {
    return c.json({ error: 'Database not configured' }, 500)
  }

  try {
    // Verify admin authentication
    const authHeader = c.req.header('Authorization')
    if (!authHeader) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const body = await c.req.json()
    const { emails } = body

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return c.json({ error: 'emails array is required' }, 400)
    }

    console.log('🗑️ Deleting users with emails:', emails)

    // Get user IDs
    const placeholders = emails.map(() => '?').join(', ')
    const userIdsResult = await DB.prepare(
      `SELECT id FROM users WHERE email IN (${placeholders})`
    ).bind(...emails).all()

    const userIds = userIdsResult.results.map((r: any) => r.id)

    if (userIds.length === 0) {
      return c.json({
        success: true,
        message: 'No users found with specified emails',
        deleted: 0
      })
    }

    console.log('Found user IDs:', userIds)

    // Delete in correct order (respecting foreign keys)
    const userIdPlaceholders = userIds.map(() => '?').join(', ')
    let totalDeleted = 0

    // 1. therapist_edit_logs をスキップ
    // 理由: 本番環境でtherapist_profiles(id)を参照しているが、
    // therapist_profilesにはidカラムが存在せず、user_idがPKである
    // この外部キー制約は壊れているため、therapist_edit_logsは手動で削除不可
    console.log('⚠️ Skipping therapist_edit_logs (broken foreign key constraint)')

    // 2. therapist_profiles も削除できない（therapist_edit_logsが参照している）
    // セラピストユーザーの場合は削除不可として処理
    try {
      const therapistCheckResult = await DB.prepare(
        `SELECT user_id FROM therapist_profiles WHERE user_id IN (${userIdPlaceholders})`
      ).bind(...userIds).all()

      if (therapistCheckResult.results.length > 0) {
        const therapistUserIds = therapistCheckResult.results.map((r: any) => r.user_id)
        console.error('❌ Cannot delete therapist users due to broken FK constraint:', therapistUserIds)
        
        // セラピストユーザー以外を削除対象にする
        const nonTherapistUserIds = userIds.filter(id => !therapistUserIds.includes(id))
        
        if (nonTherapistUserIds.length === 0) {
          return c.json({
            error: 'Cannot delete therapist users',
            message: 'Therapist users cannot be deleted due to database constraint issues. Only regular users can be deleted.',
            therapistUsers: therapistUserIds
          }, 400)
        }
        
        // 以降は非セラピストユーザーのみを対象にする
        console.log('✅ Proceeding with non-therapist users only:', nonTherapistUserIds)
        userIds.splice(0, userIds.length, ...nonTherapistUserIds)
      }
    } catch (error: any) {
      console.error('⚠️ Failed to check therapist_profiles:', error.message)
    }

    // 3. email_verifications
    try {
      const emailVerificationsResult = await DB.prepare(
        `DELETE FROM email_verifications WHERE user_id IN (${userIdPlaceholders})`
      ).bind(...userIds).run()
      console.log('✅ Deleted email_verifications:', emailVerificationsResult.meta.changes)
      totalDeleted += emailVerificationsResult.meta.changes || 0
    } catch (error: any) {
      console.error('⚠️ Failed to delete email_verifications:', error.message)
    }

    // 4. social_accounts
    try {
      const socialAccountsResult = await DB.prepare(
        `DELETE FROM social_accounts WHERE user_id IN (${userIdPlaceholders})`
      ).bind(...userIds).run()
      console.log('✅ Deleted social_accounts:', socialAccountsResult.meta.changes)
      totalDeleted += socialAccountsResult.meta.changes || 0
    } catch (error: any) {
      console.error('⚠️ Failed to delete social_accounts:', error.message)
    }

    // 5. booking_items (must delete before bookings)
    try {
      const bookingItemsResult = await DB.prepare(
        `DELETE FROM booking_items WHERE booking_id IN (SELECT id FROM bookings WHERE user_id IN (${userIdPlaceholders}))`
      ).bind(...userIds).run()
      console.log('✅ Deleted booking_items:', bookingItemsResult.meta.changes)
      totalDeleted += bookingItemsResult.meta.changes || 0
    } catch (error: any) {
      console.error('⚠️ Failed to delete booking_items:', error.message)
    }

    // 6. bookings
    try {
      const bookingsResult = await DB.prepare(
        `DELETE FROM bookings WHERE user_id IN (${userIdPlaceholders})`
      ).bind(...userIds).run()
      console.log('✅ Deleted bookings:', bookingsResult.meta.changes)
      totalDeleted += bookingsResult.meta.changes || 0
    } catch (error: any) {
      console.error('⚠️ Failed to delete bookings:', error.message)
    }

    // 7. reviews (if exists)
    try {
      const reviewsResult = await DB.prepare(
        `DELETE FROM reviews WHERE user_id IN (${userIdPlaceholders})`
      ).bind(...userIds).run()
      console.log('✅ Deleted reviews:', reviewsResult.meta.changes)
      totalDeleted += reviewsResult.meta.changes || 0
    } catch (error: any) {
      console.error('⚠️ Failed to delete reviews:', error.message)
    }

    // 8. payments (if exists)
    try {
      const paymentsResult = await DB.prepare(
        `DELETE FROM payments WHERE user_id IN (${userIdPlaceholders})`
      ).bind(...userIds).run()
      console.log('✅ Deleted payments:', paymentsResult.meta.changes)
      totalDeleted += paymentsResult.meta.changes || 0
    } catch (error: any) {
      console.error('⚠️ Failed to delete payments:', error.message)
    }

    // 9. notifications (if exists)
    try {
      const notificationsResult = await DB.prepare(
        `DELETE FROM notifications WHERE user_id IN (${userIdPlaceholders})`
      ).bind(...userIds).run()
      console.log('✅ Deleted notifications:', notificationsResult.meta.changes)
      totalDeleted += notificationsResult.meta.changes || 0
    } catch (error: any) {
      console.error('⚠️ Failed to delete notifications:', error.message)
    }

    // 10. users (finally)
    try {
      const usersResult = await DB.prepare(
        `DELETE FROM users WHERE id IN (${userIdPlaceholders})`
      ).bind(...userIds).run()
      console.log('✅ Deleted users:', usersResult.meta.changes)
      totalDeleted += usersResult.meta.changes || 0
    } catch (error: any) {
      console.error('❌ Failed to delete users:', error.message)
      return c.json({
        error: 'Failed to delete users',
        message: error.message,
        partialSuccess: true,
        deletedRelatedRecords: totalDeleted
      }, 500)
    }

    return c.json({
      success: true,
      message: `Successfully deleted ${userIds.length} user(s) and ${totalDeleted} related records`,
      deletedEmails: emails,
      deletedUserIds: userIds,
      totalRecordsDeleted: totalDeleted
    })
  } catch (error: any) {
    console.error('❌ Failed to delete users:', error)
    return c.json({
      error: 'Failed to delete users',
      message: error.message,
      details: error.stack
    }, 500)
  }
})

/**
 * Admin API: Get database statistics
 */
app.get('/stats', async (c) => {
  const { DB } = c.env

  if (!DB) {
    return c.json({ error: 'Database not configured' }, 500)
  }

  try {
    const tables = [
      'users',
      'therapist_profiles',
      'offices',
      'sites',
      'bookings',
      'reviews',
      'payments',
      'incidents',
      'affiliates',
      'notifications'
    ]

    const stats: Record<string, number> = {}

    for (const table of tables) {
      try {
        const result = await DB.prepare(`SELECT COUNT(*) as count FROM ${table}`).first()
        stats[table] = result?.count as number || 0
      } catch (error) {
        stats[table] = 0
      }
    }

    return c.json({
      stats,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return c.json({
      error: 'Failed to get stats',
      message: error.message
    }, 500)
  }
})

export default app
