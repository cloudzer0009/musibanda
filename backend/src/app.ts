import 'dotenv/config'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { type ErrorRequestHandler } from 'express'
import helmet from 'helmet'
import { pool } from './db/pool.js'
import { requireAdmin, requireAuth } from './middleware/auth.js'
import adminRouter from './routes/admin.js'
import authRouter from './routes/auth.js'

const app = express()
const frontendOrigin = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173'

app.disable('x-powered-by')
app.set('trust proxy', 1)
app.use(helmet())
app.use(cors({ origin: frontendOrigin, credentials: true }))
app.use(express.json({ limit: '20kb' }))
app.use(cookieParser())
app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const origin = req.get('origin')
    if (origin && origin !== frontendOrigin) {
      res.status(403).json({ message: 'Request origin is not allowed.' })
      return
    }
  }
  next()
})

app.get('/api/health', async (_req, res, next) => {
  try {
    await pool.query('SELECT 1')
    res.json({ status: 'ok', database: 'connected' })
  } catch (error) {
    next(error)
  }
})

app.use('/api/auth', authRouter)
app.use('/api/admin', requireAuth, requireAdmin, adminRouter)

app.use((_req, res) => {
  res.status(404).json({ message: 'Resource not found.' })
})

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error('Request failed', error)
  if (res.headersSent) return
  res.status(500).json({ message: 'An unexpected server error occurred.' })
}
app.use(errorHandler)

export default app
