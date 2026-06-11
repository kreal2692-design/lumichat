const express = require('express');
const app = express();
const path = require('path');
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

// Statik dosyaları root dizinden al
app.use(express.static(path.join(__dirname)));

// Ana sayfa isteği gelirse index.html'i gönder
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Socket.io bağlantıları
io.on('connection', (socket) => {
    console.log('Bağlanan kişi: ' + socket.id);
    // ... diğer socket mantıkların ...
});

const port = process.env.PORT || 3000;
http.listen(port, () => {
    console.log('Sunucu ' + port + ' portunda çalışıyor!');
});