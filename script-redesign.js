(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const loader = document.getElementById("loader");
  const loaderBar = document.getElementById("loaderBar");
  const loaderCount = document.getElementById("loaderCount");

  const finishLoading = () => {
    loaderBar.style.width = "100%";
    loaderCount.textContent = "100";
    window.setTimeout(() => {
      loader.classList.add("is-complete");
      document.body.classList.add("loaded");
      document.querySelectorAll(".hero .reveal").forEach((item) => item.classList.add("is-visible"));
    }, reduceMotion ? 0 : 280);
  };

  if (reduceMotion) {
    finishLoading();
  } else {
    const startedAt = performance.now();
    const loadDuration = 1250;
    const tickLoader = (now) => {
      const elapsed = now - startedAt;
      const progress = Math.min(100, Math.round((elapsed / loadDuration) * 100));
      const easedProgress = Math.round(100 * (1 - Math.pow(1 - progress / 100, 3)));
      loaderBar.style.width = `${easedProgress}%`;
      loaderCount.textContent = String(easedProgress).padStart(2, "0");
      if (progress < 100) requestAnimationFrame(tickLoader);
      else finishLoading();
    };
    requestAnimationFrame(tickLoader);
  }

  const progressBar = document.getElementById("scrollProgress");
  const updateScroll = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progressBar.style.width = `${progress}%`;
  };
  window.addEventListener("scroll", updateScroll, { passive: true });
  window.addEventListener("resize", updateScroll);
  updateScroll();

  const tickerTrack = document.querySelector(".ticker > div");
  if (tickerTrack) tickerTrack.innerHTML += tickerTrack.innerHTML;

  const revealItems = document.querySelectorAll(".reveal:not(.hero .reveal)");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px" }
    );
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const navLinks = [...document.querySelectorAll(".site-nav a")];
  const navSections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  if ("IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((link) => {
            link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
          });
        });
      },
      { rootMargin: "-35% 0px -55%" }
    );
    navSections.forEach((section) => navObserver.observe(section));
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const target = document.querySelector(anchor.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  });

  const finePointer = window.matchMedia("(pointer: fine)").matches;
  if (finePointer && !reduceMotion) {
    const dot = document.querySelector(".cursor-dot");
    const ring = document.querySelector(".cursor-ring");
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener("pointermove", (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });
    const animateCursor = () => {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      requestAnimationFrame(animateCursor);
    };
    animateCursor();

    document.querySelectorAll("a, button, input, textarea").forEach((element) => {
      element.addEventListener("pointerenter", () => ring.classList.add("is-active"));
      element.addEventListener("pointerleave", () => ring.classList.remove("is-active"));
    });

    document.querySelectorAll(".magnetic").forEach((element) => {
      element.addEventListener("pointermove", (event) => {
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * 0.16;
        const y = (event.clientY - rect.top - rect.height / 2) * 0.16;
        element.style.transform = `translate(${x}px, ${y}px)`;
      });
      element.addEventListener("pointerleave", () => {
        element.style.transform = "translate(0, 0)";
      });
    });

    document.querySelectorAll("[data-tilt]").forEach((element) => {
      element.addEventListener("pointermove", (event) => {
        const rect = element.getBoundingClientRect();
        const rotateY = ((event.clientX - rect.left) / rect.width - 0.5) * 7;
        const rotateX = ((event.clientY - rect.top) / rect.height - 0.5) * -7;
        element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });
      element.addEventListener("pointerleave", () => {
        element.style.transform = "perspective(1000px) rotateX(0) rotateY(0)";
      });
    });
  }

  const canvas = document.getElementById("speedCanvas");
  const context = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let particles = [];
  let pointerX = 0.5;
  let pointerY = 0.5;
  const particleCount = 85;

  const resetParticle = (particle, initial = false) => {
    particle.x = Math.random() * width;
    particle.y = initial ? Math.random() * height : height + Math.random() * 80;
    particle.length = 20 + Math.random() * 80;
    particle.speed = 1.1 + Math.random() * 3.7;
    particle.alpha = 0.05 + Math.random() * 0.3;
  };
  const resizeCanvas = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    particles = Array.from({ length: particleCount }, () => {
      const particle = {};
      resetParticle(particle, true);
      return particle;
    });
  };
  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("pointermove", (event) => {
    pointerX = event.clientX / window.innerWidth;
    pointerY = event.clientY / window.innerHeight;
  }, { passive: true });
  resizeCanvas();

  const drawCanvas = () => {
    context.clearRect(0, 0, width, height);
    const horizon = height * (0.3 + pointerY * 0.06);
    const vanishingX = width * (0.62 + (pointerX - 0.5) * 0.08);

    context.save();
    context.strokeStyle = "rgba(216, 255, 62, 0.11)";
    context.lineWidth = 1;
    for (let i = -8; i <= 8; i += 1) {
      context.beginPath();
      context.moveTo(vanishingX, horizon);
      context.lineTo(vanishingX + i * width * 0.12, height);
      context.stroke();
    }
    for (let row = 0; row < 12; row += 1) {
      const progress = row / 12;
      const y = horizon + Math.pow(progress, 2.15) * (height - horizon);
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }
    context.restore();

    particles.forEach((particle) => {
      const drift = (particle.x - vanishingX) * 0.0015;
      particle.y -= particle.speed;
      particle.x += drift;
      if (particle.y + particle.length < 0 || particle.x < -100 || particle.x > width + 100) {
        resetParticle(particle);
      }
      context.strokeStyle = `rgba(245, 243, 235, ${particle.alpha})`;
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(particle.x, particle.y);
      context.lineTo(particle.x, particle.y + particle.length);
      context.stroke();
    });
    if (!reduceMotion) requestAnimationFrame(drawCanvas);
  };
  drawCanvas();

  const contactForm = document.getElementById("contactForm");
  const emailModal = document.getElementById("emailModal");
  const closeEmailDialog = document.getElementById("closeEmailDialog");
  const gmailLink = document.getElementById("openGmail");
  const outlookLink = document.getElementById("openOutlook");
  const formNote = document.getElementById("formNote");
  let lastFocusedElement = null;

  const closeModal = () => {
    emailModal.classList.remove("is-open");
    emailModal.setAttribute("aria-hidden", "true");
    if (lastFocusedElement) lastFocusedElement.focus();
  };
  const openModal = () => {
    lastFocusedElement = document.activeElement;
    emailModal.classList.add("is-open");
    emailModal.setAttribute("aria-hidden", "false");
    closeEmailDialog.focus();
  };

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(contactForm);
    const name = String(formData.get("name")).trim();
    const email = String(formData.get("email")).trim();
    const subject = String(formData.get("subject")).trim();
    const message = String(formData.get("message")).trim();
    const body = `Hi Chetan,\n\n${message}\n\nRegards,\n${name}\n${email}`;
    const recipient = "chetanawari2002@gmail.com";
    gmailLink.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipient)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    outlookLink.href = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(recipient)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    formNote.textContent = "Message prepared. Choose your preferred email app.";
    openModal();
  });
  closeEmailDialog.addEventListener("click", closeModal);
  emailModal.addEventListener("click", (event) => {
    if (event.target === emailModal) closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && emailModal.classList.contains("is-open")) closeModal();
  });
})();
