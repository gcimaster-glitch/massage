import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
  STORAGE: R2Bucket
}

const app = new Hono<{ Bindings: Bindings }>()

// ============================================
// Image Upload API
// ============================================

/**
 * POST /api/images/upload
 * Upload image to R2 storage
 */
app.post('/upload', async (c) => {
  try {
    const formData = await c.req.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string || 'general' // therapist, site, office, etc.
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400)
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(7)
    const extension = file.name.split('.').pop()
    const filename = `${category}/${timestamp}-${randomStr}.${extension}`

    // Upload to R2
    const arrayBuffer = await file.arrayBuffer()
    await c.env.STORAGE.put(filename, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    })

    // Generate public URL
    const publicUrl = `/api/images/${filename}`

    return c.json({
      success: true,
      url: publicUrl,
      filename: filename,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error('Image upload error:', error)
    return c.json({ error: 'Failed to upload image' }, 500)
  }
})

/**
 * GET /api/images/:category/:filename
 * Serve image from R2 storage
 */
app.get('/:category/:filename', async (c) => {
  try {
    const category = c.req.param('category')
    const filename = c.req.param('filename')
    const key = `${category}/${filename}`

    const object = await c.env.STORAGE.get(key)
    
    if (!object) {
      return c.notFound()
    }

    const headers = new Headers()
    headers.set('Content-Type', object.httpMetadata?.contentType || 'application/octet-stream')
    headers.set('Cache-Control', 'public, max-age=31536000') // Cache for 1 year
    headers.set('ETag', object.httpEtag)

    return new Response(object.body, { headers })
  } catch (error) {
    console.error('Image retrieval error:', error)
    return c.json({ error: 'Failed to retrieve image' }, 500)
  }
})

/**
 * DELETE /api/images/:category/:filename
 * Delete image from R2 storage
 */
app.delete('/:category/:filename', async (c) => {
  try {
    const category = c.req.param('category')
    const filename = c.req.param('filename')
    const key = `${category}/${filename}`

    await c.env.STORAGE.delete(key)

    return c.json({ success: true, message: 'Image deleted successfully' })
  } catch (error) {
    console.error('Image deletion error:', error)
    return c.json({ error: 'Failed to delete image' }, 500)
  }
})

/**
 * GET /api/images/list/:category
 * List all images in a category
 */
app.get('/list/:category', async (c) => {
  try {
    const category = c.req.param('category')
    const listed = await c.env.STORAGE.list({ prefix: `${category}/` })

    const images = listed.objects.map((obj) => ({
      key: obj.key,
      url: `/api/images/${obj.key}`,
      size: obj.size,
      uploaded: obj.uploaded,
    }))

    return c.json({
      success: true,
      category,
      count: images.length,
      images,
    })
  } catch (error) {
    console.error('Image list error:', error)
    return c.json({ error: 'Failed to list images' }, 500)
  }
})

export default app
