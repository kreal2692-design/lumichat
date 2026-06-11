app.get('/', (req, res) => {
  res.send('LumiChat Backend aktif ve çalışıyor!');
});
const express = require('express');
const app = express();
const path = require('path');
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

// 1. Statik dosyaları (HTML, CSS, JS) sunucuya tanıtıyoruz
app.use(express.static(__dirname));

// 2. Ana sayfaya girilince index.html'i gönderiyoruz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

let waitingUser = null;

io.on('connection', (socket) => {
    console.log('Sitede yeni biri var: ' + socket.id);

    socket.on('join', () => {
        if (waitingUser && waitingUser.id !== socket.id) {
            let roomName = waitingUser.id + '#' + socket.id;
            socket.join(roomName);
            waitingUser.join(roomName);

            socket.emit('matched', { roomName, isInitiator: true });
            waitingUser.emit('matched', { roomName, isInitiator: false });
            
            console.log('İki kişi eşleşti!');
            waitingUser = null;
        } else {
            waitingUser = socket;
            socket.emit('waiting');
        }
    });

    socket.on('signal', (data) => {
        const rooms = Array.from(socket.rooms);
        const roomName = rooms.find(r => r.includes('#'));
        if (roomName) {
            socket.to(roomName).emit('signal', data);
        }
    });

    socket.on('leave', () => {
        const rooms = Array.from(socket.rooms);
        const roomName = rooms.find(r => r.includes('#'));
        if (roomName) {
            socket.to(roomName).emit('strangerLeft');
            socket.leave(roomName);
        }
        if (waitingUser && waitingUser.id === socket.id) waitingUser = null;
    });

    socket.on('message', (data) => {
        const rooms = Array.from(socket.rooms);
        const roomName = rooms.find(r => r.includes('#'));
        if (roomName) {
            socket.to(roomName).emit('message', data);
        }
    });

    socket.on('disconnect', () => {
        if (waitingUser && waitingUser.id === socket.id) waitingUser = null;
    });
});

// 3. Port ayarı (Render için dinamik)
const port = process.env.PORT || 3000;
http.listen(port, () => {
    console.log('LumiChat Sunucusu ' + port + ' portunda aktif!');
});