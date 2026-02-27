// ============================================
// Google Maps API Routes
// ============================================
// This file contains endpoints for Google Maps integration

import { Hono } from 'hono'

type Bindings = {
  GOOGLE_MAPS_API_KEY: string
}

const mapsApp = new Hono<{ Bindings: Bindings }>()

// ============================================
// Get Maps API Key (for client-side usage)
// ============================================
mapsApp.get('/config', (c) => {
  if (!c.env.GOOGLE_MAPS_API_KEY) {
    return c.json({ error: 'Google Maps API key not configured' }, 503)
  }
  return c.json({
    apiKey: c.env.GOOGLE_MAPS_API_KEY,
    libraries: ['places', 'geometry'],
    language: 'ja',
    region: 'JP'
  })
})

// ============================================
// Search Places (Server-side proxy for Places API)
// ============================================
mapsApp.post('/search', async (c) => {
  const { query, location, radius = 5000, type = 'spa' } = await c.req.json()
  
  const apiKey = c.env.GOOGLE_MAPS_API_KEY
  
  try {
    // Text Search API
    const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json')
    url.searchParams.set('query', query || 'マッサージ')
    url.searchParams.set('key', apiKey)
    url.searchParams.set('language', 'ja')
    url.searchParams.set('region', 'JP')
    
    if (location) {
      url.searchParams.set('location', `${location.lat},${location.lng}`)
      url.searchParams.set('radius', radius.toString())
    }
    
    if (type) {
      url.searchParams.set('type', type)
    }
    
    const response = await fetch(url.toString())
    const data = await response.json()
    
    return c.json(data)
  } catch (error) {
    return c.json({ error: 'Failed to search places', details: String(error) }, 500)
  }
})

// ============================================
// Get Place Details (Server-side proxy)
// ============================================
mapsApp.get('/place/:placeId', async (c) => {
  const placeId = c.req.param('placeId')
  const apiKey = c.env.GOOGLE_MAPS_API_KEY
  
  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
    url.searchParams.set('place_id', placeId)
    url.searchParams.set('key', apiKey)
    url.searchParams.set('language', 'ja')
    url.searchParams.set('fields', 'name,formatted_address,formatted_phone_number,opening_hours,website,rating,user_ratings_total,photos,geometry')
    
    const response = await fetch(url.toString())
    const data = await response.json()
    
    return c.json(data)
  } catch (error) {
    return c.json({ error: 'Failed to get place details', details: String(error) }, 500)
  }
})

// ============================================
// Geocode Address (Server-side proxy)
// ============================================
mapsApp.post('/geocode', async (c) => {
  const { address, latlng } = await c.req.json()
  const apiKey = c.env.GOOGLE_MAPS_API_KEY
  
  try {
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json')
    url.searchParams.set('key', apiKey)
    url.searchParams.set('language', 'ja')
    url.searchParams.set('region', 'JP')
    
    if (address) {
      url.searchParams.set('address', address)
    } else if (latlng) {
      url.searchParams.set('latlng', `${latlng.lat},${latlng.lng}`)
    } else {
      return c.json({ error: 'Either address or latlng is required' }, 400)
    }
    
    const response = await fetch(url.toString())
    const data = await response.json()
    
    return c.json(data)
  } catch (error) {
    return c.json({ error: 'Failed to geocode', details: String(error) }, 500)
  }
})

// ============================================
// Nearby Search (within radius)
// ============================================
mapsApp.post('/nearby', async (c) => {
  const { location, radius = 5000, type = 'spa', keyword } = await c.req.json()
  
  if (!location || !location.lat || !location.lng) {
    return c.json({ error: 'Location (lat, lng) is required' }, 400)
  }
  
  const apiKey = c.env.GOOGLE_MAPS_API_KEY
  
  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json')
    url.searchParams.set('location', `${location.lat},${location.lng}`)
    url.searchParams.set('radius', radius.toString())
    url.searchParams.set('key', apiKey)
    url.searchParams.set('language', 'ja')
    
    if (type) {
      url.searchParams.set('type', type)
    }
    
    if (keyword) {
      url.searchParams.set('keyword', keyword)
    }
    
    const response = await fetch(url.toString())
    const data = await response.json()
    
    return c.json(data)
  } catch (error) {
    return c.json({ error: 'Failed to search nearby places', details: String(error) }, 500)
  }
})

export default mapsApp
