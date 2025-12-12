document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // 1. HERO SECTION (Параллакс мышкой)
  // ==========================================
  const heroSection = document.querySelector(".hero-section");
  const bottle = document.querySelector(".main-bottle");
  const tag = document.querySelector(".floating-tag");

  if (heroSection && bottle && window.innerWidth > 1024) {
    heroSection.addEventListener("mousemove", (e) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const x = (centerX - e.pageX) / 30;
      const y = (centerY - e.pageY) / 30;

      bottle.style.transform = `rotate(3deg) translate(${x}px, ${y}px)`;
      if (tag) {
        tag.style.transform = `translate(${x * 1.5}px, ${y * 1.5}px)`;
      }
    });

    heroSection.addEventListener("mouseleave", () => {
      bottle.style.transform = "rotate(3deg)";
      if (tag) tag.style.transform = "translate(0,0)";
    });
  }

  // ==========================================
  // 2. MISSION SECTION (Параллакс мышкой)
  // ==========================================
  const missionSection = document.querySelector(".mission-impact-section");
  const bottlesLayer = document.querySelector(".bottles-layer");
  const glassCard = document.querySelector(".glass-lens-card");

  if (missionSection && bottlesLayer && window.innerWidth > 1024) {
    missionSection.addEventListener("mousemove", (e) => {
      const x = window.innerWidth / 2 - e.pageX;
      const y = window.innerHeight / 2 - e.pageY;

      bottlesLayer.style.transform = `translate(${x * 0.02}px, ${y * 0.02}px)`;

      if (glassCard) {
        glassCard.style.transform = `perspective(1000px) rotateY(${
          -5 + x * 0.01
        }deg) translate(${-x * 0.03}px, ${-y * 0.03}px)`;
      }
    });

    missionSection.addEventListener("mouseleave", () => {
      bottlesLayer.style.transform = "translate(0,0)";
      if (glassCard)
        glassCard.style.transform = "perspective(1000px) rotateY(-5deg)";
    });
  }

  // ==========================================
  // 3. ABOUT SECTION (Эффект при скролле)
  // ==========================================
  const aboutSection = document.querySelector(".about-composition-section");
  const backBottle = document.querySelector(".bottle-back");

  // Работаем только на десктопе
  if (aboutSection && backBottle && window.innerWidth > 1024) {
    window.addEventListener("scroll", () => {
      const rect = aboutSection.getBoundingClientRect();

      // Вычисляем, насколько секция появилась на экране
      // Чем больше мы скроллим вниз, тем больше это число
      const scrollProgress = window.innerHeight - rect.top;

      // Начинаем анимацию, когда секция начинает появляться
      if (scrollProgress > 0) {
        // Базовый наклон: 15deg
        // Добавляем наклон при скролле (коэффициент 0.05 для плавности)
        const rotation = 15 + scrollProgress * 0.015;

        // Важно: сохраняем translateY(-30px), который задан в CSS
        backBottle.style.transform = `rotate(${rotation}deg) translateY(-30px)`;
      }
    });
  }

  // ==========================================
  // 4. SMOOTH SCROLL (Якорные ссылки)
  // ==========================================
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  });
});

// ==========================================
// 5. 3D TILT EFFECT FOR CARDS
// ==========================================
const cards = document.querySelectorAll(".b-card-light");

if (window.innerWidth > 1024) {
  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Вычисляем вращение (от -10 до 10 градусов)
      const xRotation = -1 * ((y - rect.height / 2) / 20);
      const yRotation = (x - rect.width / 2) / 20;

      card.style.transform = `perspective(1000px) rotateX(${xRotation}deg) rotateY(${yRotation}deg) scale(1.02)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform =
        "perspective(1000px) rotateX(0) rotateY(0) scale(1)";
    });
  });
}
const siteHeader = document.getElementById("siteHeader");

const setHeaderGlass = () => {
  if (!siteHeader) return;
  siteHeader.classList.toggle("is-glass", window.scrollY > 10);
};

setHeaderGlass();
addEventListener("scroll", setHeaderGlass, { passive: true });

const burgerBtn = document.getElementById("burgerBtn");
const mobileMenu = document.getElementById("mobileMenu");

const openMenu = () => {
  if (!burgerBtn || !mobileMenu) return;
  mobileMenu.classList.add("is-open");
  mobileMenu.setAttribute("aria-hidden", "false");
  burgerBtn.setAttribute("aria-expanded", "true");
  document.documentElement.style.overflow = "hidden";
};

const closeMenu = () => {
  if (!burgerBtn || !mobileMenu) return;
  mobileMenu.classList.remove("is-open");
  mobileMenu.setAttribute("aria-hidden", "true");
  burgerBtn.setAttribute("aria-expanded", "false");
  document.documentElement.style.overflow = "";
};

if (burgerBtn && mobileMenu) {
  burgerBtn.addEventListener("click", () => {
    if (mobileMenu.classList.contains("is-open")) closeMenu();
    else openMenu();
  });

  mobileMenu.addEventListener("click", (e) => {
    const t = e.target;
    if (t && t.closest && t.closest("[data-menu-close]")) closeMenu();
    if (t && t.classList && t.classList.contains("mobile-link")) closeMenu();
  });

  addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
}

document.querySelectorAll("[data-scroll]").forEach((el) => {
  el.addEventListener("click", (e) => {
    const targetSel = el.getAttribute("data-scroll");
    const target = targetSel ? document.querySelector(targetSel) : null;
    if (!target) return;
    e.preventDefault();
    closeMenu();
    target.scrollIntoView({ behavior: "smooth" });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".terminal-form");
  if (!form) return;

  const textarea = form.querySelector("textarea");
  const btn = form.querySelector('button[type="submit"]');

  const API_BASE =
    location.hostname === "localhost"
      ? "http://localhost:3333"
      : "https://YOUR_BACKEND_DOMAIN";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const message = (textarea?.value || "").trim();
    if (!message) return;

    btn && (btn.disabled = true);

    try {
      const r = await fetch(`${API_BASE}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, page: location.href }),
      });

      if (!r.ok) throw new Error("bad_status");

      textarea.value = "";
      alert("Отправлено в Telegram");
    } catch (err) {
      alert("Не отправилось. Проверь сервер и .env");
    } finally {
      btn && (btn.disabled = false);
    }
  });
});
