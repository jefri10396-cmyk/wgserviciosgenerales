document.addEventListener("DOMContentLoaded", function () {
  const cookieBanner = document.getElementById("cookieBanner");
  const cookieModal = document.getElementById("cookieModal");
  const acceptCookies = document.getElementById("acceptCookies");
  const rejectCookies = document.getElementById("rejectCookies");
  const openCookieModal = document.getElementById("openCookieModal");
  const cancelCookieModal = document.getElementById("cancelCookieModal");
  const saveCookiePreferences = document.getElementById("saveCookiePreferences");
  const analyticsCookies = document.getElementById("analyticsCookies");
  const marketingCookies = document.getElementById("marketingCookies");
  const openCookieSettings = document.getElementById("openCookieSettings");
  const siteHeader = document.getElementById("siteHeader");
  const chat = document.getElementById("wg-chat");
  const closeBtn = document.getElementById("wg-close");
  const button = document.querySelector(".wg-button");
  const navLinks = document.querySelectorAll("#mainNav .nav-link");
  const navCollapse = document.getElementById("mainNav");
  const consentStorageKey = "wg_cookie_preferences_v1";

  const applyConsent = function (preferences) {
    if (typeof window.gtag !== "function") {
      return;
    }
    window.gtag("consent", "update", {
      analytics_storage: preferences.analytics ? "granted" : "denied",
      ad_storage: preferences.marketing ? "granted" : "denied",
      ad_user_data: preferences.marketing ? "granted" : "denied",
      ad_personalization: preferences.marketing ? "granted" : "denied"
    });
  };

  const saveConsent = function (preferences) {
    localStorage.setItem(consentStorageKey, JSON.stringify(preferences));
    applyConsent(preferences);
    if (cookieBanner) {
      cookieBanner.classList.remove("show");
    }
    if (cookieModal) {
      cookieModal.classList.remove("show");
      cookieModal.setAttribute("aria-hidden", "true");
    }
  };

  const openPreferencesModal = function () {
    if (cookieModal) {
      cookieModal.classList.add("show");
      cookieModal.setAttribute("aria-hidden", "false");
    }
  };

  const closePreferencesModal = function () {
    if (cookieModal) {
      cookieModal.classList.remove("show");
      cookieModal.setAttribute("aria-hidden", "true");
    }
  };

  const savedConsent = localStorage.getItem(consentStorageKey);
  if (savedConsent) {
    try {
      const parsed = JSON.parse(savedConsent);
      if (analyticsCookies) {
        analyticsCookies.checked = !!parsed.analytics;
      }
      if (marketingCookies) {
        marketingCookies.checked = !!parsed.marketing;
      }
      applyConsent({
        analytics: !!parsed.analytics,
        marketing: !!parsed.marketing
      });
    } catch (error) {
      localStorage.removeItem(consentStorageKey);
      if (cookieBanner) {
        cookieBanner.classList.add("show");
      }
    }
  } else if (cookieBanner) {
    cookieBanner.classList.add("show");
  }

  if (acceptCookies) {
    acceptCookies.addEventListener("click", function () {
      if (analyticsCookies) {
        analyticsCookies.checked = true;
      }
      if (marketingCookies) {
        marketingCookies.checked = true;
      }
      saveConsent({ analytics: true, marketing: true });
    });
  }

  if (rejectCookies) {
    rejectCookies.addEventListener("click", function () {
      if (analyticsCookies) {
        analyticsCookies.checked = false;
      }
      if (marketingCookies) {
        marketingCookies.checked = false;
      }
      saveConsent({ analytics: false, marketing: false });
    });
  }

  if (openCookieModal) {
    openCookieModal.addEventListener("click", openPreferencesModal);
  }

  if (cancelCookieModal) {
    cancelCookieModal.addEventListener("click", closePreferencesModal);
  }

  if (saveCookiePreferences) {
    saveCookiePreferences.addEventListener("click", function () {
      saveConsent({
        analytics: !!(analyticsCookies && analyticsCookies.checked),
        marketing: !!(marketingCookies && marketingCookies.checked)
      });
    });
  }

  if (openCookieSettings) {
    openCookieSettings.addEventListener("click", function () {
      if (cookieBanner) {
        cookieBanner.classList.add("show");
      }
      openPreferencesModal();
    });
  }

  const handleHeaderShadow = function () {
    if (!siteHeader) {
      return;
    }
    if (window.scrollY > 14) {
      siteHeader.classList.add("scrolled");
    } else {
      siteHeader.classList.remove("scrolled");
    }
  };

  handleHeaderShadow();
  window.addEventListener("scroll", handleHeaderShadow);

  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      if (!navCollapse || !window.bootstrap) {
        return;
      }
      const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
      if (bsCollapse) {
        bsCollapse.hide();
      }
    });
  });

  const contactForm = document.querySelector(".contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();
      window.open(
        "https://wa.me/51964976557?text=Hola%20necesito%20cotizar%20un%20servicio",
        "_blank"
      );
    });
  }

  if (!chat || !closeBtn || !button) {
    return;
  }

  button.addEventListener("click", function () {
    chat.classList.toggle("open");
  });

  closeBtn.addEventListener("click", function () {
    chat.classList.remove("open");
  });

  document.addEventListener("click", function (event) {
    const target = event.target;
    if (target instanceof Element && !chat.contains(target)) {
      chat.classList.remove("open");
    }
  });
});
