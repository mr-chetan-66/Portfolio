const loader = document.getElementById("loader");
const progress = document.getElementById("scrollProgress");
const indicator = document.getElementById("sectionIndicator");
const flash = document.getElementById("sectionFlash");
const heroScene = document.getElementById("heroScene");
const eventEndpoint =
  window.PORTFOLIO_EVENT_ENDPOINT ||
  document.querySelector('meta[name="portfolio-event-endpoint"]')?.content ||
  "";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const trackPortfolioEvent = (eventName, detail = {}) => {
  if (!eventName || !eventEndpoint.startsWith("https://")) return;

  const payload = {
    eventName,
    detail,
    path: window.location.pathname,
    referrer: document.referrer || "",
    timestamp: new Date().toISOString(),
  };

  const body = JSON.stringify(payload);
  if (navigator.sendBeacon) {
    navigator.sendBeacon(eventEndpoint, new Blob([body], { type: "application/json" }));
    return;
  }

  fetch(eventEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
};

window.addEventListener("load", () => {
  window.setTimeout(() => {
    loader?.classList.add("hidden");
    document.body.classList.add("loaded");
  }, 1150);

  trackPortfolioEvent("page_view", { title: document.title });
});

document.querySelectorAll(".roll-link").forEach((link) => {
  const text = link.dataset.roll || link.textContent.trim();
  if (!text) return;

  const makeWord = (clone = false) => {
    const word = document.createElement("span");
    word.className = clone ? "roll-word clone" : "roll-word";
    [...text].forEach((char, index) => {
      const span = document.createElement("span");
      span.className = "roll-char";
      span.style.setProperty("--i", index);
      span.textContent = char === " " ? "\u00a0" : char;
      word.appendChild(span);
    });
    return word;
  };

  const slot = document.createElement("span");
  slot.className = "roll-slot";
  slot.append(makeWord(false), makeWord(true));
  link.textContent = "";
  link.appendChild(slot);
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
);

document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 6, 5) * 70}ms`;
  revealObserver.observe(element);
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    const active = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!active) return;

    const name = active.target.dataset.sectionName || "Home";
    if (indicator && indicator.textContent !== name) {
      indicator.textContent = name;
      if (flash && !prefersReducedMotion) {
        flash.textContent = name;
        flash.classList.remove("is-active");
        void flash.offsetWidth;
        flash.classList.add("is-active");
      }
    }

    const id = active.target.id;
    if (id) {
      document.querySelectorAll(".site-nav a").forEach((link) => {
        const isActive = link.getAttribute("href") === `#${id}`;
        link.classList.toggle("is-active", isActive);
        if (isActive) {
          link.classList.remove("roll-active");
          void link.offsetWidth;
          link.classList.add("roll-active");
          window.setTimeout(() => link.classList.remove("roll-active"), 500);
        }
      });
    }
  },
  { threshold: [0.32, 0.48, 0.64] }
);

document.querySelectorAll(".watch-section").forEach((section) => {
  sectionObserver.observe(section);
});

const updateProgress = () => {
  if (!progress) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const amount = max > 0 ? (window.scrollY / max) * 100 : 0;
  progress.style.width = `${amount}%`;
};

window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

if (heroScene && !prefersReducedMotion) {
  heroScene.addEventListener("pointermove", (event) => {
    const rect = heroScene.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    heroScene.style.setProperty("--ry", `${x * 9}deg`);
    heroScene.style.setProperty("--rx", `${y * -7}deg`);
  });

  heroScene.addEventListener("pointerleave", () => {
    heroScene.style.setProperty("--ry", "0deg");
    heroScene.style.setProperty("--rx", "0deg");
  });
}

const emailPicker = document.querySelector("[data-email-picker]");
const emailToggle = emailPicker?.querySelector(".email-toggle");

if (emailPicker && emailToggle) {
  const setEmailPicker = (open) => {
    emailPicker.classList.toggle("is-open", open);
    emailToggle.setAttribute("aria-expanded", String(open));
  };

  emailToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    setEmailPicker(!emailPicker.classList.contains("is-open"));
  });

  emailPicker.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  document.addEventListener("click", () => setEmailPicker(false));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setEmailPicker(false);
      emailToggle.focus();
    }
  });
}

document.querySelectorAll("[data-track-event], [data-track]").forEach((element) => {
  element.addEventListener("click", () => {
    trackPortfolioEvent(element.dataset.trackEvent || element.dataset.track, {
      label: element.dataset.trackLabel || element.textContent.trim(),
      href: element.getAttribute("href") || "",
    });
  });
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  });
});
