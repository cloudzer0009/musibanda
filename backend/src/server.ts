import 'dotenv/config'
import app from './app.js'
import { pool } from './db/pool.js'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set before starting the API')
}

const port = Number(process.env.PORT ?? 3000)
const server = app.listen(port, () => {
  console.log(`Musibanda API listening on port ${port}`)
})

function shutdown() {
  server.close(() => {
    void pool.end().then(() => process.exit(0))
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
