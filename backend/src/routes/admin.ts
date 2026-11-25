import { randomUUID } from 'node:crypto'
import { Router } from 'express'
import { z } from 'zod'
import { pool } from '../db/pool.js'

const router = Router()
const roleSchema = z.enum(['admin', 'customer', 'musician'])
const bookingStatusSchema = z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'rejected'])
const userUpdateSchema = z.object({
  fullName: z.string().trim().min(2).max(120).optional(),
  email: z.string().trim().email().max(254).optional(),
  phone: z.string().trim().min(7).max(30).optional(),
  role: roleSchema.optional(),
  isActive: z.boolean().optional(),
}).refine((value) => Object.keys(value).length > 0)
const notificationUpdateSchema = z.object({ isRead: z.boolean() })

router.get('/dashboard', async (_req, res, next) => {
  try {
    const [users, musicians, customers, bookings, pending, payments, statuses, recentBookings, recentUsers] =
      await Promise.all([
        pool.query('SELECT COUNT(*)::int AS count FROM users'),
        pool.query("SELECT COUNT(*)::int AS count FROM users WHERE role = 'musician'"),
        pool.query("SELECT COUNT(*)::int AS count FROM users WHERE role = 'customer'"),
        pool.query('SELECT COUNT(*)::int AS count FROM bookings'),
        pool.query("SELECT COUNT(*)::int AS count FROM bookings WHERE status = 'pending'"),
        pool.query('SELECT COUNT(*)::int AS count FROM payments'),
        pool.query('SELECT status, COUNT(*)::int AS count FROM bookings GROUP BY status ORDER BY status'),
        pool.query(
          `SELECT b.id, b.event_date, b.event_type, b.status, b.amount,
                  customer.full_name AS customer_name,
                  COALESCE(profile.stage_name, musician.full_name) AS musician_name
           FROM bookings b
           JOIN users customer ON customer.id = b.customer_id
           JOIN users musician ON musician.id = b.musician_id
           LEFT JOIN musician_profiles profile ON profile.user_id = musician.id
           ORDER BY b.created_at DESC LIMIT 6`,
        ),
        pool.query(
          `SELECT id, full_name, email, role, created_at
           FROM users ORDER BY created_at DESC LIMIT 6`,
        ),
      ])

    res.setHeader('Cache-Control', 'no-store')
    res.json({
      totals: {
        users: users.rows[0].count,
        musicians: musicians.rows[0].count,
        customers: customers.rows[0].count,
        bookings: bookings.rows[0].count,
        pendingBookings: pending.rows[0].count,
        paymentRecords: payments.rows[0].count,
      },
      bookingStatuses: statuses.rows,
      recentBookings: recentBookings.rows,
      recentUsers: recentUsers.rows,
    })
  } catch (error) {
    next(error)
  }
})

router.get('/users', async (req, res, next) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : ''
  const role = roleSchema.safeParse(req.query.role)
  if (req.query.role && !role.success) {
    res.status(400).json({ message: 'Invalid account role filter.' })
    return
  }

  const values: unknown[] = []
  const conditions: string[] = []
  if (role.success && req.query.role) {
    values.push(role.data)
    conditions.push(`u.role = $${values.length}`)
  }
  if (search) {
    values.push(`%${search}%`)
    conditions.push(`(u.full_name ILIKE $${values.length} OR u.email ILIKE $${values.length} OR u.phone ILIKE $${values.length})`)
  }

  try {
    const result = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.role, u.is_active, u.created_at
       FROM users u ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
       ORDER BY u.created_at DESC LIMIT 100`,
      values,
    )
    res.json({ users: result.rows })
  } catch (error) {
    next(error)
  }
})

router.patch('/users/:id', async (req, res, next) => {
  const id = z.string().uuid().safeParse(req.params.id)
  const parsed = userUpdateSchema.safeParse(req.body)
  if (!id.success || !parsed.success) {
    res.status(400).json({ message: 'Provide a valid user ID and at least one valid field.' })
    return
  }

  const input = parsed.data
  if (id.data === req.user?.id && (input.isActive === false || input.role && input.role !== 'admin')) {
    res.status(400).json({ message: 'You cannot deactivate or change your own administrator account.' })
    return
  }

  const columns: Record<keyof typeof input, string> = {
    fullName: 'full_name',
    email: 'email',
    phone: 'phone',
    role: 'role',
    isActive: 'is_active',
  }
  const values: unknown[] = [id.data]
  const assignments = Object.entries(input).map(([key, value]) => {
    values.push(key === 'email' ? String(value).toLowerCase() : value)
    return `${columns[key as keyof typeof input]} = $${values.length}`
  })

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await client.query(
      `UPDATE users SET ${assignments.join(', ')}, updated_at = NOW()
       WHERE id = $1
       RETURNING id, full_name, email, phone, role, is_active, created_at`,
      values,
    )
    if (!result.rows[0]) {
      await client.query('ROLLBACK')
      res.status(404).json({ message: 'User not found.' })
      return
    }
    if (input.role === 'musician') {
      await client.query(
        `INSERT INTO musician_profiles (user_id, stage_name)
         SELECT id, full_name FROM users WHERE id = $1
         ON CONFLICT (user_id) DO NOTHING`,
        [id.data],
      )
    }
    await client.query('COMMIT')
    res.json({ user: result.rows[0] })
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

router.get('/musicians', async (req, res, next) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : ''
  try {
    const result = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.is_active, u.created_at,
              p.stage_name, p.bio, p.genres, p.city
       FROM users u
       LEFT JOIN musician_profiles p ON p.user_id = u.id
       WHERE u.role = 'musician'
         AND ($1 = '' OR u.full_name ILIKE $2 OR u.email ILIKE $2
              OR COALESCE(p.stage_name, '') ILIKE $2 OR COALESCE(p.city, '') ILIKE $2)
       ORDER BY u.created_at DESC LIMIT 100`,
      [search, `%${search}%`],
    )
    res.json({ musicians: result.rows })
  } catch (error) {
    next(error)
  }
})

router.get('/bookings', async (req, res, next) => {
  const status = req.query.status ? bookingStatusSchema.safeParse(req.query.status) : null
  if (status && !status.success) {
    res.status(400).json({ message: 'Invalid booking status filter.' })
    return
  }
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : ''
  try {
    const result = await pool.query(
      `SELECT b.id, b.event_date, b.event_type, b.location, b.status, b.amount, b.created_at,
              customer.full_name AS customer_name,
              COALESCE(profile.stage_name, musician.full_name) AS musician_name
       FROM bookings b
       JOIN users customer ON customer.id = b.customer_id
       JOIN users musician ON musician.id = b.musician_id
       LEFT JOIN musician_profiles profile ON profile.user_id = musician.id
       WHERE ($1::text IS NULL OR b.status = $1)
         AND ($2 = '' OR b.event_type ILIKE $3 OR b.location ILIKE $3
              OR customer.full_name ILIKE $3 OR musician.full_name ILIKE $3)
       ORDER BY b.created_at DESC LIMIT 100`,
      [status?.success ? status.data : null, search, `%${search}%`],
    )
    res.json({ bookings: result.rows })
  } catch (error) {
    next(error)
  }
})

router.get('/bookings/:id', async (req, res, next) => {
  const id = z.string().uuid().safeParse(req.params.id)
  if (!id.success) {
    res.status(400).json({ message: 'Invalid booking ID.' })
    return
  }
  try {
    const result = await pool.query(
      `SELECT b.id, b.event_date, b.event_type, b.location, b.notes, b.status, b.amount, b.created_at,
              customer.full_name AS customer_name, customer.email AS customer_email,
              COALESCE(profile.stage_name, musician.full_name) AS musician_name,
              musician.email AS musician_email
       FROM bookings b
       JOIN users customer ON customer.id = b.customer_id
       JOIN users musician ON musician.id = b.musician_id
       LEFT JOIN musician_profiles profile ON profile.user_id = musician.id
       WHERE b.id = $1`,
      [id.data],
    )
    if (!result.rows[0]) {
      res.status(404).json({ message: 'Booking not found.' })
      return
    }
    res.json({ booking: result.rows[0] })
  } catch (error) {
    next(error)
  }
})

router.get('/payments', async (_req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.amount, p.currency, p.status, p.payment_method, p.reference, p.created_at,
              b.id AS booking_id, b.event_type, b.event_date,
              customer.full_name AS customer_name
       FROM payments p
       JOIN bookings b ON b.id = p.booking_id
       JOIN users customer ON customer.id = b.customer_id
       ORDER BY p.created_at DESC LIMIT 100`,
    )
    res.json({ payments: result.rows })
  } catch (error) {
    next(error)
  }
})

router.get('/notifications', async (_req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, user_id, title, message, is_read, created_at
       FROM notifications ORDER BY created_at DESC LIMIT 100`,
    )
    res.json({ notifications: result.rows })
  } catch (error) {
    next(error)
  }
})

router.post('/notifications', async (req, res, next) => {
  const inputSchema = z.object({
    title: z.string().trim().min(1).max(160),
    message: z.string().trim().min(1).max(2000),
    userId: z.string().uuid().nullable().optional(),
  })
  const parsed = inputSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Enter a notification title and message.' })
    return
  }
  try {
    const result = await pool.query(
      `INSERT INTO notifications (id, user_id, title, message)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, title, message, is_read, created_at`,
      [randomUUID(), parsed.data.userId ?? null, parsed.data.title, parsed.data.message],
    )
    res.status(201).json({ notification: result.rows[0] })
  } catch (error) {
    next(error)
  }
})

router.patch('/notifications/:id', async (req, res, next) => {
  const id = z.string().uuid().safeParse(req.params.id)
  const parsed = notificationUpdateSchema.safeParse(req.body)
  if (!id.success || !parsed.success) {
    res.status(400).json({ message: 'Provide a valid notification ID and read state.' })
    return
  }
  try {
    const result = await pool.query(
      `UPDATE notifications SET is_read = $2 WHERE id = $1
       RETURNING id, user_id, title, message, is_read, created_at`,
      [id.data, parsed.data.isRead],
    )
    if (!result.rows[0]) {
      res.status(404).json({ message: 'Notification not found.' })
      return
    }
    res.json({ notification: result.rows[0] })
  } catch (error) {
    next(error)
  }
})

export default router
