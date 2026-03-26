import { io, Socket } from 'socket.io-client'

// We store the socket instance here so it is shared across the whole app
// This is called a singleton - only one instance ever exists
let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io({
      path: '/socket.io',
    })
  }
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}