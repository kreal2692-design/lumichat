const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Klasordeki statik dosyalari sun
app.use(express.static(__dirname));

// Ana sayfa
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

let waitingUser = null;
const pairs = new Map();

function getPartnerId(socketId) {
  return pairs.get(socketId) || null;
}

function pairUsers(socketA, socketB) {
  pairs.set(socketA.id, socketB.id);
  pairs.set(socketB.id, socketA.id);

  socketA.emit("matched", { isInitiator: true });
  socketB.emit("matched", { isInitiator: false });
}

function unpair(socket) {
  const partnerId = pairs.get(socket.id);
  if (!partnerId) return;

  pairs.delete(socket.id);
  pairs.delete(partnerId);

  const partnerSocket = io.sockets.sockets.get(partnerId);
  if (partnerSocket) {
    partnerSocket.emit("strangerLeft");
  }
}

io.on("connection", (socket) => {
  console.log("Baglandi:", socket.id);

  socket.on("join", () => {
    console.log("join:", socket.id);

    if (waitingUser && waitingUser.id !== socket.id) {
      const partner = waitingUser;
      waitingUser = null;
      pairUsers(socket, partner);
    } else {
      waitingUser = socket;
      socket.emit("waiting");
    }
  });

  socket.on("next", () => {
    console.log("next:", socket.id);

    if (waitingUser && waitingUser.id === socket.id) {
      waitingUser = null;
    }

    unpair(socket);

    if (waitingUser && waitingUser.id !== socket.id) {
      const partner = waitingUser;
      waitingUser = null;
      pairUsers(socket, partner);
    } else {
      waitingUser = socket;
      socket.emit("waiting");
    }
  });

  socket.on("leave", () => {
    console.log("leave:", socket.id);

    if (waitingUser && waitingUser.id === socket.id) {
      waitingUser = null;
    }

    unpair(socket);
  });

  socket.on("message", (text) => {
    const partnerId = getPartnerId(socket.id);
    if (!partnerId) return;

    const partnerSocket = io.sockets.sockets.get(partnerId);
    if (partnerSocket) {
      partnerSocket.emit("message", text);
    }
  });

  socket.on("signal", (data) => {
    const partnerId = getPartnerId(socket.id);
    if (!partnerId) return;

    const partnerSocket = io.sockets.sockets.get(partnerId);
    if (partnerSocket) {
      partnerSocket.emit("signal", data);
    }
  });

  socket.on("disconnect", () => {
    console.log("Ayrildi:", socket.id);

    if (waitingUser && waitingUser.id === socket.id) {
      waitingUser = null;
    }

    unpair(socket);
  });
});

server.listen(PORT, () => {
  console.log(`Server calisiyor: http://localhost:${PORT}`);
});
