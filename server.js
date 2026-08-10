import { Server } from 'socket.io'

const port = Number(process.env.PORT) || 3001
const roomCode = new Map()

const io = new Server(port, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
  },
})

io.on('connection', (socket) => {
  socket.on('join-room', (roomId) => {
    if (typeof roomId !== 'string' || !roomId.trim()) return

    // A socket belongs to one editing room at a time.
    for (const joinedRoom of socket.rooms) {
      if (joinedRoom !== socket.id) socket.leave(joinedRoom)
    }
    socket.join(roomId)
    socket.emit('room-state', roomCode.get(roomId) ?? {})
  })

  socket.on('code-change', ({ roomId, language, content } = {}) => {
    if (
      typeof roomId !== 'string' ||
      !['HTML', 'CSS', 'JavaScript'].includes(language) ||
      typeof content !== 'string'
    ) return

    const currentRoomCode = roomCode.get(roomId) ?? {}
    roomCode.set(roomId, { ...currentRoomCode, [language]: content })

    // Send only to peers: the author already has the change and keeps its cursor untouched.
    socket.to(roomId).emit('code-change', { language, content })
  })
})

console.log(`Collaboration server listening on http://localhost:${port}`)
