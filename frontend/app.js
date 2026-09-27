```javascript
/* =========================================================
   UPI-PAY
   Frontend Application
========================================================= */

"use strict";

/* =========================================================
   CONFIGURATION
========================================================= */

// We will connect this to Railway later.
const API_BASE_URL = "";

// Exchange rates used by the frontend calculator.
// These are display/calculation rates for the prototype.
// The backend will become the source of truth later.
const RATES = {
  INR_PKR: 3.20,
  PKR_INR: 0.3125,

  USD_PKR: 280,
  PKR_USD: 0.003571,

  USDT_PKR: 280,
  PKR_USDT: 0.003571
};


/* =========================================================
   DOM HELPERS
========================================================= */

const $ = (selector) => {
  return document.querySelector(selector);
};

const $$ = (selector) => {
  return document.querySelectorAll(selector);
};


/* =========================================================
   APPLICATION STATE
========================================================= */

const state = {
  loggedIn: false,
  user: null,
  walletBalance: 0,
  authMode: "login",
  selectedPayment: null
};


/* =========================================================
   DOM ELEMENTS
========================================================= */

const authModal = $("#authModal");
const closeAuthModal = $("#closeAuthModal");

const authTitle = $("#authTitle");
const authSubtitle = $("#authSubtitle");
const authMessage = $("#authMessage");

const loginForm = $("#loginForm");
const registerForm = $("#registerForm");
const forgotForm = $("#forgotForm");

const mobileMenuBtn = $("#mobileMenuBtn");
const mobileNav = $("#mobileNav");

const fromAmount = $("#fromAmount");
const fromCurrency = $("#fromCurrency");
const toAmount = $("#toAmount");
const toCurrency = $("#toCurrency");

const exchangeRate = $("#exchangeRate");

const toast = $("#toast");


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  setCurrentYear();

  setupNavigation();

  setupAuth();

  setupExchange();

  setupPaymentMethods();

  setupWalletButtons();

  setupHeroButtons();

  calculateExchange();

});


/* =========================================================
   YEAR
========================================================= */

function setCurrentYear() {

  const yearElement = $("#currentYear");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

}


/* =========================================================
   MOBILE NAVIGATION
========================================================= */

function setupNavigation() {

  if (!mobileMenuBtn || !mobileNav) {
    return;
  }

  mobileMenuBtn.addEventListener("click", () => {

    const active = mobileNav.classList.toggle("active");

    mobileMenuBtn.setAttribute(
      "aria-expanded",
      active ? "true" : "false"
    );

  });


  const mobileLinks = mobileNav.querySelectorAll("a");

  mobileLinks.forEach((link) => {

    link.addEventListener("click", () => {

      mobileNav.classList.remove("active");

      mobileMenuBtn.setAttribute(
        "aria-expanded",
        "false"
      );

    });

  });

}


/* =========================================================
   AUTHENTICATION UI
========================================================= */

function setupAuth() {

  // Login buttons
  bindClick("#loginBtn", () => {
    openAuthModal("login");
  });

  bindClick("#mobileLoginBtn", () => {
    closeMobileMenu();
    openAuthModal("login");
  });

  bindClick("#walletLoginBtn", () => {
    openAuthModal("login");
  });

  bindClick("#footerLoginBtn", () => {
    openAuthModal("login");
  });


  // Register buttons
  bindClick("#registerBtn", () => {
    openAuthModal("register");
  });

  bindClick("#mobileRegisterBtn", () => {
    closeMobileMenu();
    openAuthModal("register");
  });

  bindClick("#heroRegisterBtn", () => {
    openAuthModal("register");
  });

  bindClick("#ctaRegisterBtn", () => {
    openAuthModal("register");
  });

  bindClick("#footerRegisterBtn", () => {
    openAuthModal("register");
  });


  // Close modal
  if (closeAuthModal) {

    closeAuthModal.addEventListener(
      "click",
      closeAuthModalWindow
    );

  }


  if (authModal) {

    authModal.addEventListener("click", (event) => {

      if (event.target === authModal) {
        closeAuthModalWindow();
      }

    });

  }


  // Login → Register
  bindClick("#showRegisterBtn", () => {
    openAuthModal("register");
  });


  // Register → Login
  bindClick("#showLoginBtn", () => {
    openAuthModal("login");
  });


  // Forgot password
  bindClick("#forgotPasswordBtn", () => {
    openAuthModal("forgot");
  });


  // Forgot → Login
  bindClick("#backToLoginBtn", () => {
    openAuthModal("login");
  });


  // Forms
  if (loginForm) {

    loginForm.addEventListener(
      "submit",
      handleLogin
    );

  }


  if (registerForm) {

    registerForm.addEventListener(
      "submit",
      handleRegister
    );

  }


  if (forgotForm) {

    forgotForm.addEventListener(
      "submit",
      handleForgotPassword
    );

  }


  // Escape key
  document.addEventListener("keydown", (event) => {

    if (
      event.key === "Escape" &&
      authModal &&
      authModal.classList.contains("active")
    ) {

      closeAuthModalWindow();

    }

  });

}


/* =========================================================
   OPEN AUTH MODAL
========================================================= */

function openAuthModal(mode) {

  if (!authModal) {
    return;
  }

  state.authMode = mode;

  authModal.classList.add("active");

  authModal.setAttribute(
    "aria-hidden",
    "false"
  );

  clearAuthMessage();

  if (mode === "login") {

    showAuthForm("login");

    authTitle.textContent =
      "Welcome back";

    authSubtitle.textContent =
      "Login to your UPI-Pay account.";

  }


  if (mode === "register") {

    showAuthForm("register");

    authTitle.textContent =
      "Create your account";

    authSubtitle.textContent =
      "Start using UPI-Pay today.";

  }


  if (mode === "forgot") {

    showAuthForm("forgot");

    authTitle.textContent =
      "Reset your password";

    authSubtitle.textContent =
      "Enter your account information.";

  }


  document.body.style.overflow = "hidden";

}


/* =========================================================
   CLOSE AUTH MODAL
========================================================= */

function closeAuthModalWindow() {

  if (!authModal) {
    return;
  }

  authModal.classList.remove("active");

  authModal.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.style.overflow = "";

  clearAuthMessage();

}


/* =========================================================
   SHOW AUTH FORM
========================================================= */

function showAuthForm(type) {

  if (loginForm) {
    loginForm.classList.add("hidden");
  }

  if (registerForm) {
    registerForm.classList.add("hidden");
  }

  if (forgotForm) {
    forgotForm.classList.add("hidden");
  }


  if (type === "login" && loginForm) {
    loginForm.classList.remove("hidden");
  }

  if (type === "register" && registerForm) {
    registerForm.classList.remove("hidden");
  }

  if (type === "forgot" && forgotForm) {
    forgotForm.classList.remove("hidden");
  }

}


/* =========================================================
   LOGIN
========================================================= */

async function handleLogin(event) {

  event.preventDefault();

  const identifier =
    $("#loginIdentifier")?.value.trim();

  const password =
    $("#loginPassword")?.value;

  if (!identifier || !password) {

    showAuthMessage(
      "Please enter your username/phone and password."
    );

    return;
  }


  /*
    Backend connection will be enabled later.

    For now this is only the frontend flow.
  */

  showAuthMessage(
    "Login system will be connected to the secure backend next."
  );

}


/* =========================================================
   REGISTER
========================================================= */

async function handleRegister(event) {

  event.preventDefault();

  const username =
    $("#registerUsername")?.value.trim();

  const phone =
    $("#registerPhone")?.value.trim();

  const password =
    $("#registerPassword")?.value;

  const confirmPassword =
    $("#registerConfirmPassword")?.value;

  const terms =
    $("#acceptTerms")?.checked;


  if (!username || !phone || !password) {

    showAuthMessage(
      "Please complete all required fields."
    );

    return;
  }


  if (username.length < 3) {

    showAuthMessage(
      "Username must contain at least 3 characters."
    );

    return;
  }


  if (!/^[0-9]{7,12}$/.test(phone)) {

    showAuthMessage(
      "Please enter a valid Pakistani phone number."
    );

    return;
  }


  if (password.length < 8) {

    showAuthMessage(
      "Password must contain at least 8 characters."
    );

    return;
  }


  if (password !== confirmPassword) {

    showAuthMessage(
      "Passwords do not match."
    );

    return;
  }


  if (!terms) {

    showAuthMessage(
      "Please accept the Terms and Privacy Policy."
    );

    return;
  }


  /*
    Backend registration will be connected later.
  */

  showAuthMessage(
    "Registration interface is ready. Backend connection comes next."
  );

}


/* =========================================================
   FORGOT PASSWORD
========================================================= */

async function handleForgotPassword(event) {

  event.preventDefault();

  const identifier =
    $("#forgotIdentifier")?.value.trim();

  if (!identifier) {

    showAuthMessage(
      "Please enter your username or phone number."
    );

    return;
  }


  /*
    Password recovery backend will be added later.
  */

  showAuthMessage(
    "Password recovery will be connected to the backend next."
  );

}


/* =========================================================
   AUTH MESSAGES
========================================================= */

function showAuthMessage(message) {

  if (!authMessage) {
    return;
  }

  authMessage.textContent = message;

}


function clearAuthMessage() {

  if (authMessage) {
    authMessage.textContent = "";
  }

}


/* =========================================================
   EXCHANGE CALCULATOR
========================================================= */

function setupExchange() {

  if (fromAmount) {

    fromAmount.addEventListener(
      "input",
      calculateExchange
    );

  }


  if (fromCurrency) {

    fromCurrency.addEventListener(
      "change",
      calculateExchange
    );

  }


  if (toCurrency) {

    toCurrency.addEventListener(
      "change",
      calculateExchange
    );

  }


  bindClick(
    "#swapCurrencyBtn",
    swapCurrencies
  );


  const exchangeForm =
    $("#exchangeForm");

  if (exchangeForm) {

    exchangeForm.addEventListener(
      "submit",
      handleExchangeSubmit
    );

  }

}


/* =========================================================
   CALCULATE EXCHANGE
========================================================= */

function calculateExchange() {

  if (
    !fromAmount ||
    !fromCurrency ||
    !toCurrency ||
    !toAmount
  ) {
    return;
  }


  const amount =
    Number.parseFloat(fromAmount.value);


  if (
    !Number.isFinite(amount) ||
    amount < 0
  ) {

    toAmount.value = "0.00";

    return;
  }


  const from =
    fromCurrency.value;

  const to =
    toCurrency.value;


  if (from === to) {

    toAmount.value =
      formatNumber(amount);

    exchangeRate.textContent =
      `1 ${from} = 1 ${to}`;

    updateHeroExchange(
      amount,
      amount,
      from,
      to
    );

    return;
  }


  const rate =
    getExchangeRate(from, to);


  if (!rate) {

    toAmount.value = "0.00";

    exchangeRate.textContent =
      "Rate unavailable";

    return;
  }


  const result =
    amount * rate;


  toAmount.value =
    formatNumber(result);


  exchangeRate.textContent =
    `1 ${from} = ${formatRate(rate)} ${to}`;


  updateHeroExchange(
    amount,
    result,
    from,
    to
  );

}


/* =========================================================
   GET EXCHANGE RATE
========================================================= */

function getExchangeRate(from, to) {

  const key =
    `${from}_${to}`;

  return RATES[key] || null;

}


/* =========================================================
   SWAP CURRENCIES
========================================================= */

function swapCurrencies() {

  if (!fromCurrency || !toCurrency) {
    return;
  }


  const oldFrom =
    fromCurrency.value;

  const oldTo =
    toCurrency.value;


  fromCurrency.value =
    oldTo;

  toCurrency.value =
    oldFrom;


  calculateExchange();

}


/* =========================================================
   HERO EXCHANGE
========================================================= */

function updateHeroExchange(
  fromValue,
  toValue,
  from,
  to
) {

  const heroFrom =
    $("#heroFromAmount");

  const heroTo =
    $("#heroToAmount");


  if (heroFrom) {

    heroFrom.textContent =
      formatNumber(fromValue);

  }


  if (heroTo) {

    heroTo.textContent =
      formatNumber(toValue);

  }

}


/* =========================================================
   EXCHANGE SUBMIT
========================================================= */

function handleExchangeSubmit(event) {

  event.preventDefault();

  const amount =
    Number.parseFloat(fromAmount?.value || "0");

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {

    showToast(
      "Please enter a valid exchange amount."
    );

    return;
  }


  if (!state.loggedIn) {

    showToast(
      "Please login or create an account to continue."
    );

    openAuthModal("login");

    return;
  }


  showToast(
    "Exchange flow will continue through your account."
  );

}


/* =========================================================
   PAYMENT METHODS
========================================================= */

function setupPaymentMethods() {

  const paymentCards =
    $$(".payment-card");


  paymentCards.forEach((card) => {

    card.addEventListener(
      "click",
      () => {

        const payment =
          card.dataset.payment;

        state.selectedPayment =
          payment;


        showToast(
          `${payment} selected.`
        );

      }
    );

  });

}


/* =========================================================
   WALLET BUTTONS
========================================================= */

function setupWalletButtons() {

  bindClick(
    "#depositBtn",
    () => {

      if (!state.loggedIn) {

        showToast(
          "Please login to deposit funds."
        );

        openAuthModal("login");

        return;
      }


      showToast(
        "Deposit system will be connected to the backend."
      );

    }
  );


  bindClick(
    "#withdrawBtn",
    () => {

      if (!state.loggedIn) {

        showToast(
          "Please login to withdraw funds."
        );

        openAuthModal("login");

        return;
      }


      showToast(
        "Withdrawal system will be connected to the backend."
      );

    }
  );

}


/* =========================================================
   HERO BUTTONS
========================================================= */

function setupHeroButtons() {

  bindClick(
    "#heroExchangeBtn",
    () => {

      document
        .querySelector("#exchange")
        ?.scrollIntoView({
          behavior: "smooth"
        });

    }
  );

}


/* =========================================================
   MOBILE MENU CLOSE
========================================================= */

function closeMobileMenu() {

  if (!mobileNav) {
    return;
  }

  mobileNav.classList.remove("active");

  if (mobileMenuBtn) {

    mobileMenuBtn.setAttribute(
      "aria-expanded",
      "false"
    );

  }

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer = null;

function showToast(message) {

  if (!toast) {
    return;
  }


  toast.textContent =
    message;


  toast.classList.add("show");


  clearTimeout(toastTimer);


  toastTimer = setTimeout(() => {

    toast.classList.remove("show");

  }, 3500);

}


/* =========================================================
   FORMAT NUMBER
========================================================= */

function formatNumber(value) {

  if (!Number.isFinite(value)) {
    return "0.00";
  }


  return new Intl.NumberFormat(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  ).format(value);

}


/* =========================================================
   FORMAT RATE
========================================================= */

function formatRate(value) {

  if (!Number.isFinite(value)) {
    return "0";
  }


  if (value >= 1) {

    return value.toFixed(2);

  }


  return value.toFixed(6);

}


/* =========================================================
   GENERIC CLICK HELPER
========================================================= */

function bindClick(selector, handler) {

  const element =
    $(selector);

  if (!element) {
    return;
  }


  element.addEventListener(
    "click",
    handler
  );

}


/* =========================================================
   DEBUG HELPER
========================================================= */

window.UPIPay = {

  state,

  calculateExchange,

  openLogin() {
    openAuthModal("login");
  },

  openRegister() {
    openAuthModal("register");
  }

};


console.log(
  "UPI-Pay frontend loaded successfully."
);
```
