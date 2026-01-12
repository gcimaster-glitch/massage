// ============================================
// Social Auth Provider Configurations
// ============================================

import { SocialAuthProvider } from './auth-helpers'

export function getProvider(providerName: string, env: any): SocialAuthProvider | null {
  switch (providerName.toUpperCase()) {
    case 'GOOGLE':
      return {
        name: 'GOOGLE',
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        userInfoUrl: 'https://www.googleapis.com/oauth2/v3/userinfo',
        clientId: env.GOOGLE_CLIENT_ID || '',
        clientSecret: env.GOOGLE_CLIENT_SECRET || '',
        scope: ['openid', 'email', 'profile'],
      }

    case 'YAHOO':
      return {
        name: 'YAHOO',
        authUrl: 'https://auth.login.yahoo.co.jp/yconnect/v2/authorization',
        tokenUrl: 'https://auth.login.yahoo.co.jp/yconnect/v2/token',
        userInfoUrl: 'https://userinfo.yahooapis.jp/yconnect/v2/attribute',
        clientId: env.YAHOO_CLIENT_ID || '',
        clientSecret: env.YAHOO_CLIENT_SECRET || '',
        scope: ['openid', 'email', 'profile'],
      }

    case 'X':
    case 'TWITTER':
      return {
        name: 'X',
        authUrl: 'https://twitter.com/i/oauth2/authorize',
        tokenUrl: 'https://api.twitter.com/2/oauth2/token',
        userInfoUrl: 'https://api.twitter.com/2/users/me',
        clientId: env.X_CLIENT_ID || '',
        clientSecret: env.X_CLIENT_SECRET || '',
        scope: ['tweet.read', 'users.read', 'offline.access'],
      }

    case 'FACEBOOK':
      return {
        name: 'FACEBOOK',
        authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
        tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
        userInfoUrl: 'https://graph.facebook.com/me?fields=id,name,email,picture',
        clientId: env.FACEBOOK_CLIENT_ID || '',
        clientSecret: env.FACEBOOK_CLIENT_SECRET || '',
        scope: ['email', 'public_profile'],
      }

    case 'LINE':
      return {
        name: 'LINE',
        authUrl: 'https://access.line.me/oauth2/v2.1/authorize',
        tokenUrl: 'https://api.line.me/oauth2/v2.1/token',
        userInfoUrl: 'https://api.line.me/v2/profile',
        clientId: env.LINE_CLIENT_ID || '',
        clientSecret: env.LINE_CLIENT_SECRET || '',
        scope: ['profile', 'openid', 'email'],
      }

    case 'APPLE':
      return {
        name: 'APPLE',
        authUrl: 'https://appleid.apple.com/auth/authorize',
        tokenUrl: 'https://appleid.apple.com/auth/token',
        userInfoUrl: '', // Apple uses ID token
        clientId: env.APPLE_CLIENT_ID || '',
        clientSecret: env.APPLE_CLIENT_SECRET || '',
        scope: ['name', 'email'],
      }

    default:
      return null
  }
}

export const SUPPORTED_PROVIDERS = [
  'GOOGLE',
  'YAHOO',
  'X',
  'FACEBOOK',
  'LINE',
  'APPLE',
] as const

export type SupportedProvider = typeof SUPPORTED_PROVIDERS[number]
