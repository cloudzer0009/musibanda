import assert from 'node:assert/strict'
import test from 'node:test'
import { loginSchema, registerSchema } from './auth.js'

const validRegistration = {
  fullName: 'Avery Music',
  email: 'avery@example.com',
  password: 'StrongPass2026',
  phone: '+639171234567',
  role: 'customer',
}

test('registration accepts customer and musician roles only', () => {
  assert.equal(registerSchema.safeParse(validRegistration).success, true)
  assert.equal(
    registerSchema.safeParse({ ...validRegistration, role: 'musician' }).success,
    true,
  )
  assert.equal(
    registerSchema.safeParse({ ...validRegistration, role: 'admin' }).success,
    false,
  )
})

test('registration rejects malformed emails and weak passwords', () => {
  assert.equal(registerSchema.safeParse({ ...validRegistration, email: 'not-an-email' }).success, false)
  assert.equal(registerSchema.safeParse({ ...validRegistration, password: 'weakpass' }).success, false)
})

test('login validates an email and requires a password', () => {
  assert.equal(loginSchema.safeParse({ email: 'avery@example.com', password: 'x' }).success, true)
  assert.equal(loginSchema.safeParse({ email: 'invalid', password: 'x' }).success, false)
  assert.equal(loginSchema.safeParse({ email: 'avery@example.com', password: '' }).success, false)
})
