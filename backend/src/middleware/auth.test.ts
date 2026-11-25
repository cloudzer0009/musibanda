import assert from 'node:assert/strict'
import { once } from 'node:events'
import type { AddressInfo } from 'node:net'
import express from 'express'
import test from 'node:test'
import { requireAdmin, type UserRole } from './auth.js'

test('administrator guard rejects customer and musician roles', async (context) => {
  const app = express()
  app.get('/admin', (req, _res, next) => {
    const role = req.get('x-test-role')
    if (role === 'admin' || role === 'customer' || role === 'musician') {
      req.user = { id: 'test-user', fullName: 'Test User', email: 'test@example.com', phone: '12345678', role: role as UserRole, isActive: true }
    }
    next()
  }, requireAdmin, (_req, res) => res.status(204).end())

  const server = app.listen(0, '127.0.0.1')
  await once(server, 'listening')
  context.after(() => new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve())
  }))

  const address = server.address() as AddressInfo
  for (const role of ['customer', 'musician']) {
    const response = await fetch(`http://127.0.0.1:${address.port}/admin`, { headers: { 'x-test-role': role } })
    assert.equal(response.status, 403)
  }
  const adminResponse = await fetch(`http://127.0.0.1:${address.port}/admin`, { headers: { 'x-test-role': 'admin' } })
  assert.equal(adminResponse.status, 204)
})
