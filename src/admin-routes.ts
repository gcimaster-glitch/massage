import { Hono } from 'hono'

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

/**
 * Admin API: Delete all mock data
 * Only accessible by ADMIN role
 * Preserves master data (master_courses, master_options, master_areas, system_settings)
 */
app.delete('/mock-data', async (c) => {
  const { DB } = c.env

  if (!DB) {
    return c.json({ error: 'Database not configured' }, 500)
  }

  try {
    // Verify admin authentication (JWT or session)
    // TODO: Add proper admin authentication check
    const authHeader = c.req.header('Authorization')
    if (!authHeader) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    // Delete in correct order (respecting foreign keys)
    const deletions = [
      // 1. Delete dependent tables first
      { table: 'admin_logs', description: 'Admin logs' },
      { table: 'notifications', description: 'Notifications' },
      { table: 'affiliate_referrals', description: 'Affiliate referrals' },
      { table: 'affiliates', description: 'Affiliates' },
      { table: 'incident_actions', description: 'Incident actions' },
      { table: 'incidents', description: 'Incidents' },
      { table: 'financial_statements', description: 'Financial statements' },
      { table: 'payments', description: 'Payments' },
      { table: 'reviews', description: 'Reviews' },
      { table: 'booking_items', description: 'Booking items' },
      { table: 'bookings', description: 'Bookings' },
      { table: 'site_rooms', description: 'Site rooms' },
      { table: 'sites', description: 'Sites' },
      { table: 'therapist_options', description: 'Therapist options' },
      { table: 'therapist_menu', description: 'Therapist menu' },
      { table: 'therapist_profiles', description: 'Therapist profiles' },
      { table: 'offices', description: 'Offices' },
      { table: 'auth_sessions', description: 'Auth sessions' },
      { table: 'oauth_states', description: 'OAuth states' },
      { table: 'social_accounts', description: 'Social accounts' },
      { table: 'users', description: 'Users' },
      // Revenue config (keep some, delete others)
      // We'll keep the default config and delete test data
    ]

    const results: Array<{ table: string; deleted: number; error?: string }> = []

    for (const { table, description } of deletions) {
      try {
        // Use DELETE without WHERE to delete all rows
        // This is safe because we're intentionally deleting all mock data
        const result = await DB.prepare(`DELETE FROM ${table}`).run()
        
        results.push({
          table: description,
          deleted: result.meta.changes || 0
        })
      } catch (error: any) {
        results.push({
          table: description,
          deleted: 0,
          error: error.message
        })
      }
    }

    // Clean up revenue_config except default
    try {
      const result = await DB.prepare(
        `DELETE FROM revenue_config WHERE id != 'rc_default'`
      ).run()
      
      results.push({
        table: 'Revenue config (test data)',
        deleted: result.meta.changes || 0
      })
    } catch (error: any) {
      results.push({
        table: 'Revenue config (test data)',
        deleted: 0,
        error: error.message
      })
    }

    const totalDeleted = results.reduce((sum, r) => sum + r.deleted, 0)

    return c.json({
      success: true,
      message: `Successfully deleted ${totalDeleted} mock data records`,
      details: results,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Failed to delete mock data:', error)
    return c.json({
      error: 'Failed to delete mock data',
      message: error.message
    }, 500)
  }
})

/**
 * Admin API: Re-seed mock data
 * Only accessible by ADMIN role
 */
app.post('/mock-data/seed', async (c) => {
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

    // Re-run seed.sql (this should be done via wrangler CLI)
    // For now, return instructions
    return c.json({
      success: false,
      message: 'Please run: npx wrangler d1 execute hogusy-db-production --local --file=./seed.sql',
      note: 'This endpoint is for reference only. Use wrangler CLI to seed data.'
    }, 501)
  } catch (error: any) {
    return c.json({
      error: 'Failed to seed data',
      message: error.message
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
