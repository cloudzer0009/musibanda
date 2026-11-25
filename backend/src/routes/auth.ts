import { randomBytes, randomUUID } from 'node:crypto'
import { Router, type Response } from 'express'
import bcrypt from 'bcryptjs'
import { rateLimit } from 'express-rate-limit'
import { pool } from '../db/pool.js'
import { hashSessionToken, requireAuth } from '../middleware/auth.js'
import { loginSchema, registerSchema } from '../validation/auth.js'

const router = Router()
const registrationSessionLifetimeMs = 7 * 24 * 60 * 60 * 1000
const rememberedSessionLifetimeMs = 30 * 24 * 60 * 60 * 1000
const sessionLifetimeMs = 8 * 60 * 60 * 1000
const dummyPasswordHash = bcrypt.hash(randomBytes(32).toString('hex'), 12)
const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
}
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Email or password is incorrect.' },
})

function setSessionCookie(res: Response, token: string, maxAge?: number) {
  res.cookie('musibanda_session', token, { ...cookieOptions, ...(maxAge ? { maxAge } : {}) })
}

router.post('/register', async (req, res, next) => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message ?? 'Please check your details.' })
    return
  }

  const input = parsed.data
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const passwordHash = await bcrypt.hash(input.password, 12)
    const userId = randomUUID()
    const userResult = await client.query(
      `INSERT INTO users (id, full_name, email, password_hash, phone, role)
       VALUES ($1, $2, LOWER($3), $4, $5, $6)
       RETURNING id, full_name, email, phone, role, is_active`,
      [userId, input.fullName, input.email, passwordHash, input.phone, input.role],
    )

    if (input.role === 'musician') {
      await client.query(
        'INSERT INTO musician_profiles (user_id, stage_name) VALUES ($1, $2)',
        [userId, input.fullName],
      )
    }

    const token = randomBytes(32).toString('hex')
    const tokenHash = hashSessionToken(token)
    await client.query(
      'INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)',
      [tokenHash, userId, new Date(Date.now() + registrationSessionLifetimeMs)],
    )
    await client.query('COMMIT')
    setSessionCookie(res, token, registrationSessionLifetimeMs)
    const user = userResult.rows[0]
    res.status(201).json({
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.is_active,
      },
    })
  } catch (error) {
    await client.query('ROLLBACK')
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
      res.status(409).json({ message: 'An account with this email already exists.' })
      return
    }
    next(error)
  } finally {
    client.release()
  }
})

router.post('/login', loginRateLimit, async (req, res, next) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Enter a valid email address and password.' })
    return
  }

  try {
    const result = await pool.query(
      `SELECT id, full_name, email, phone, role, password_hash, is_active
       FROM users WHERE LOWER(email) = LOWER($1)`,
      [parsed.data.email],
    )
    const user = result.rows[0]
    const storedHash = user?.password_hash ?? await dummyPasswordHash
    const validPassword = await bcrypt.compare(parsed.data.password, storedHash)
    if (!user || !validPassword || !user.is_active) {
      res.status(401).json({ message: 'Email or password is incorrect.' })
      return
    }

    const token = randomBytes(32).toString('hex')
    const lifetime = parsed.data.rememberMe ? rememberedSessionLifetimeMs : sessionLifetimeMs
    await pool.query(
      'INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)',
      [hashSessionToken(token), user.id, new Date(Date.now() + lifetime)],
    )
    setSessionCookie(res, token, parsed.data.rememberMe ? rememberedSessionLifetimeMs : undefined)
    res.json({
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.is_active,
      },
    })
  } catch (error) {
    next(error)
  }
})

router.get('/me', requireAuth, (req, res) => {
  res.setHeader('Cache-Control', 'no-store')
  res.json({ user: req.user })
})

router.post('/logout', async (req, res, next) => {
  const token = req.cookies?.musibanda_session
  try {
    if (typeof token === 'string') {
      await pool.query('DELETE FROM sessions WHERE token_hash = $1', [hashSessionToken(token)])
    }
    res.clearCookie('musibanda_session', cookieOptions)
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

export default router
