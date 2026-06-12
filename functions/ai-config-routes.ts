import { Hono } from 'hono'

type Bindings = { GEMINI_API_KEY: string }

const app = new Hono<{ Bindings: Bindings }>()

// GET /api/ai/config - クライアントへ Gemini API キーをランタイムで提供
// Google Maps の /api/maps/config と同じパターン
app.get('/config', (c) => {
  if (!c.env.GEMINI_API_KEY) {
    return c.json({ error: 'Gemini API key not configured' }, 503)
  }
  return c.json({ apiKey: c.env.GEMINI_API_KEY })
})

export default app
