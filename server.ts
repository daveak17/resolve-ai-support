import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import next from 'next'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000

// Create the Next.js app
const app = next({ dev, hostname, port })
const handler = app.getRequestHandler()

app.prepare().then(() => {
  // Create an HTTP server that Next.js uses
  const httpServer = createServer(handler)

  // Attach Socket.io to the same HTTP server
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  // This runs when a client connects
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    // When a user opens a ticket, they join that ticket's room
    socket.on('join-ticket', (ticketId: string) => {
      socket.join(ticketId)
      console.log(`Socket ${socket.id} joined ticket room: ${ticketId}`)
    })

    socket.on('leave-ticket', (ticketId: string) => {
      socket.leave(ticketId)
      console.log(`Socket ${socket.id} left ticket room: ${ticketId}`)
    })

    // When a user sends a message
    socket.on('send-message', (data: {
      ticketId: string
      message: {
        id: string
        content: string
        sender: {
          id: string
          name: string | null
          role: string
        }
        createdAt: string
      }
    }) => {
      // Broadcast the message to everyone else in the same ticket room
      // 'to' sends to everyone in the room EXCEPT the sender
      socket.to(data.ticketId).emit('message-received', data.message)
      console.log(`Message broadcast to ticket room: ${data.ticketId}`)
    })

    // When a user disconnects
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })

  // Start the server
  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})