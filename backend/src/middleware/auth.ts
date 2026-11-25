import { createHash } from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'
import { pool } from '../db/pool.js'

export type UserRole = 'admin' | 'customer' | 'musician'
export type AuthenticatedUser = {
  id: string
  fullName: string
  email: string
  phone: string
  role: UserRole
  isActive: boolean
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser
    }
  }
}

export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.musibanda_session
  if (typeof token !== 'string' || token.length !== 64) {
    res.status(401).json({ message: 'Please sign in to continue.' })
    return
  }

  const tokenHash = hashSessionToken(token)
  try {
    const result = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.role, u.is_active
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = $1 AND s.expires_at > NOW()`,
      [tokenHash],
    )
    const row = result.rows[0]
    if (!row || !row.is_active) {
      res.clearCookie('musibanda_session', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' })
      res.status(401).json({ message: 'Please sign in to continue.' })
      return
    }

    req.user = {
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      role: row.role,
      isActive: row.is_active,
    }
    next()
  } catch (error) {
    next(error)
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: 'Administrator access is required.' })
    return
  }
  next()
}
