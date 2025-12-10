import http from 'http'
import express from 'express'
import { WebSocketServer } from 'ws'
import { setupWSConnection } from 'y-websocket/bin/utils'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Initialize Express app
const app = express()

// Create HTTP server
const server = http.createServer(app)

// Create WebSocket server
const wss = new WebSocketServer({ server })

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    uptime: process.uptime(),
    connections: wss.clients.size
  })
})

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Obsidian Team Sync Server',
    version: '0.1.0',
    status: 'running'
  })
})

// WebSocket connection handler
// The setupWSConnection function from y-websocket handles:
// - Room management (clients with same room name share a Y.Doc)
// - Yjs protocol (sync, awareness, updates)
// - Broadcasting updates to all clients in the room
wss.on('connection', (ws, req) => {
  setupWSConnection(ws, req, {
    // Optional: Add garbage collection config
    // gc: true
  })
})

// Graceful shutdown handler
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server gracefully...')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

// Start server
const PORT = process.env.PORT || 1234
server.listen(PORT, () => {
  console.log(`🚀 Obsidian Team Sync Server running on port ${PORT}`)
  console.log(`   Health check: http://localhost:${PORT}/health`)
  console.log(`   WebSocket: ws://localhost:${PORT}`)
})
