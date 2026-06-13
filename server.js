const express = require('express');
const app = express();
const path = require('path');
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

app.use(express.static(__dirname));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// Bekleyen kullanıcı havuzu: { socketId, genderFilter, myGender }
let waitingUsers = [];

function findMatch(socket, genderFilter, myGender) {
  for (let i = 0; i < waitingUsers.length; i++) {
    const w = waitingUsers[i];
    if (w.socketId === socket.id) continue;

    // Cinsiyet filtresi kontrolü
    const iMatch = genderFilter === "herkesle" ||
      (genderFilter === "kadin"  && w.myGender === "kadin") ||
      (genderFilter === "erkek"  && w.myGender === "erkek");

    // Karşı tarafın filtresi de uyumlu olmalı
    const theyMatch = w.genderFilter === "herkesle" ||
      (w.genderFilter === "kadin"  && myGender === "kadin") ||
      (w.genderFilter === "erkek"  && myGender === "erkek");

    if (iMatch && theyMatch) {
      waitingUsers.splice(i, 1);
      return w;
    }
  }
  return null;
}

io.on('connection', (socket) => {
  console.log('Yeni bağlantı: ' + socket.id);

  socket.on('join', (data = {}) => {
    const genderFilter = data.genderFilter || "herkesle";
    const myGender     = data.myGender     || "belirtmek-istemiyorum";

    // Eşleşme ara
    const match = findMatch(socket, genderFilter, myGender);

    if (match) {
      const roomName = match.socketId + '#' + socket.id;
      const matchSocket = io.sockets.sockets.get(match.socketId);
      if (!matchSocket) {
        // Karşı taraf bağlantısı kopmuş, beklemeye al
        waitingUsers.push({ socketId: socket.id, genderFilter, myGender });
        socket.emit('waiting');
        return;
      }

      socket.join(roomName);
      matchSocket.join(roomName);

      socket.emit('matched',     { roomName, isInitiator: true,  partnerSocketId: match.socketId });
      matchSocket.emit('matched', { roomName, isInitiator: false, partnerSocketId: socket.id });

      console.log('Eşleşti: ' + match.socketId + ' <-> ' + socket.id);
    } else {
      waitingUsers.push({ socketId: socket.id, genderFilter, myGender });
      socket.emit('waiting');
    }
  });

  socket.on('signal', (data) => {
    const rooms = Array.from(socket.rooms);
    const roomName = rooms.find(r => r.includes('#'));
    if (roomName) socket.to(roomName).emit('signal', data);
  });

  socket.on('message', (data) => {
    const rooms = Array.from(socket.rooms);
    const roomName = rooms.find(r => r.includes('#'));
    if (roomName) socket.to(roomName).emit('message', data);
  });

  socket.on('leave', () => {
    const rooms = Array.from(socket.rooms);
    const roomName = rooms.find(r => r.includes('#'));
    if (roomName) {
      socket.to(roomName).emit('strangerLeft');
      socket.leave(roomName);
    }
    waitingUsers = waitingUsers.filter(w => w.socketId !== socket.id);
  });

  socket.on('next', () => {
    const rooms = Array.from(socket.rooms);
    const roomName = rooms.find(r => r.includes('#'));
    if (roomName) {
      socket.to(roomName).emit('strangerLeft');
      socket.leave(roomName);
    }
    waitingUsers = waitingUsers.filter(w => w.socketId !== socket.id);
  });

  socket.on('disconnect', () => {
    waitingUsers = waitingUsers.filter(w => w.socketId !== socket.id);
    const rooms = Array.from(socket.rooms);
    const roomName = rooms.find(r => r.includes('#'));
    if (roomName) socket.to(roomName).emit('strangerLeft');
    console.log('Ayrıldı: ' + socket.id);
  });
});

const port = process.env.PORT || 3000;
http.listen(port, () => console.log('LumiChat ' + port + ' portunda aktif'));
