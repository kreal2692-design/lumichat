const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

let waitingUser = null;

function getChatRoom(socket) {
  return Array.from(socket.rooms).find((room) => room !== socket.id);
}

function removeFromWaiting(socket) {
  if (waitingUser && waitingUser.id === socket.id) {
    waitingUser = null;
  }
}

function leaveCurrentRoom(socket) {
  const roomName = getChatRoom(socket);

  if (roomName) {
    socket.to(roomName).emit('strangerLeft');
    socket.leave(roomName);
  }
}

function joinQueue(socket) {
  if (waitingUser && waitingUser.id !== socket.id) {
    const roomName = [waitingUser.id, socket.id].sort().join('#');

    socket.join(roomName);
    waitingUser.join(roomName);

    socket.emit('matched', { roomName, isInitiator: true });
    waitingUser.emit('matched', { roomName, isInitiator: false });

    console.log(`Eslesme oldu: ${waitingUser.id} <-> ${socket.id}`);
    waitingUser = null;
  } else {
    waitingUser = socket;
    socket.emit('waiting');
    console.log(`Bekleme sirasinda: ${socket.id}`);
  }
}

io.on('connection', (socket) => {
  console.log(`Baglanan kisi: ${socket.id}`);

  socket.on('join', () => {
    removeFromWaiting(socket);
    leaveCurrentRoom(socket);
    joinQueue(socket);
  });

  socket.on('next', () => {
    removeFromWaiting(socket);
    leaveCurrentRoom(socket);
    joinQueue(socket);
  });

  socket.on('leave', () => {
    removeFromWaiting(socket);
    leaveCurrentRoom(socket);
    socket.emit('waiting');
  });

  socket.on('message', (data) => {
    const roomName = getChatRoom(socket);

    if (roomName) {
      socket.to(roomName).emit('message', data);
    }
  });

  socket.on('signal', (data) => {
    const roomName = getChatRoom(socket);

    if (roomName) {
      socket.to(roomName).emit('signal', data);
    }
  });

  socket.on('disconnect', () => {
    removeFromWaiting(socket);
    leaveCurrentRoom(socket);
    console.log(`Ayrilan kisi: ${socket.id}`);
  });
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`LumiChat sunucusu ${port} portunda aktif`);
});
