import 'dotenv/config'
import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { pool } from '../db/pool.js'
import { registerSchema } from '../validation/auth.js'

async function createAdministrator() {
  const name = process.env.ADMIN_NAME?.trim()
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const phone = process.env.ADMIN_PHONE?.trim()
  const password = process.env.ADMIN_PASSWORD
  if (!name || !email || !phone || !password) {
    throw new Error('Set ADMIN_NAME, ADMIN_EMAIL, ADMIN_PHONE, and ADMIN_PASSWORD for this command.')
  }
  const parsed = registerSchema.safeParse({
    fullName: name,
    email,
    password,
    phone,
    role: 'customer',
  })
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Administrator details are invalid.')
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12)
  const result = await pool.query(
    `INSERT INTO users (id, full_name, email, password_hash, phone, role)
     VALUES ($1, $2, LOWER($3), $4, $5, 'admin')
     RETURNING id, email`,
    [randomUUID(), parsed.data.fullName, parsed.data.email, passwordHash, parsed.data.phone],
  )
  console.log(`Administrator created: ${result.rows[0].email}`)
}

createAdministrator()
  .catch((error: unknown) => {
    console.error('Could not create administrator:', error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
  .finally(() => pool.end())
