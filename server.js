import { Server } from 'socket.io';
import http from 'http';

const port = Number(process.env.PORT) || 3001;
const roomCode = new Map();

// 1. Ek normal HTTP server banayein taaki Socket.io us par bind ho sake
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Code Collaboration Backend is Running Status: OK\n');
});

// 2. Ab Server instance ko is http server ke sath initialize karein
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  socket.on('join-room', (roomId) => {
    if (typeof roomId !== 'string' || !roomId.trim()) return;

    for (const joinedRoom of socket.rooms) {
      if (joinedRoom !== socket.id) socket.leave(joinedRoom);
    }
    socket.join(roomId);
    socket.emit('room-state', roomCode.get(roomId) ?? {});
  });

  socket.on('code-change', ({ roomId, language, content } = {}) => {
    if (
      typeof roomId !== 'string' ||
      !['HTML', 'CSS', 'JavaScript'].includes(language) ||
      typeof content !== 'string'
    ) return;

    const currentRoomCode = roomCode.get(roomId) ?? {};
    roomCode.set(roomId, { ...currentRoomCode, [language]: content });

    socket.to(roomId).emit('code-change', { language, content });
  });
});

// 3. App.listen ki jagah server.listen ka use karein jo Render ke liye zaroori hai
server.listen(port, () => {
  console.log(`Collaboration server listening on port ${port}`);
});
