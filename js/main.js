document.addEventListener("DOMContentLoaded", function () {
  const siteHeader = document.getElementById("siteHeader");
  const chat = document.getElementById("wg-chat");
  const closeBtn = document.getElementById("wg-close");
  const button = document.querySelector(".wg-button");
  const navLinks = document.querySelectorAll("#mainNav .nav-link");
  const navCollapse = document.getElementById("mainNav");

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
