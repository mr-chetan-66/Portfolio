const root = document.documentElement;
const body = document.body;
const themeToggle = document.querySelector("#themeToggle");
const navLinks = [...document.querySelectorAll(".main-nav a")];
const sections = navLinks.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
const filterButtons = [...document.querySelectorAll(".filter-button")];
const projectCards = [...document.querySelectorAll(".project-card")];
const contactForm = document.querySelector("#contactForm");
const formNote = document.querySelector("#formNote");
const emailModal = document.querySelector("#emailModal");
const closeEmailDialog = document.querySelector("#closeEmailDialog");
const openGmail = document.querySelector("#openGmail");
const openOutlook = document.querySelector("#openOutlook");
const emailTriggers = [...document.querySelectorAll("[data-email-trigger]")];
const contactEmail = "chetanawari2002@gmail.com";

localStorage.setItem("portfolio-theme", "light");
body.classList.remove("dark");

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function setThemeIcon() {
  const icon = themeToggle?.querySelector("i");
  if (!icon) return;
  icon.setAttribute("data-lucide", body.classList.contains("dark") ? "moon" : "sun");
  refreshIcons();
}

themeToggle?.addEventListener("click", () => {
  body.classList.toggle("dark");
  setThemeIcon();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    projectCards.forEach((card) => {
      const matches = filter === "all" || card.dataset.type.includes(filter);
      card.classList.toggle("is-hidden", !matches);
    });
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
);

sections.forEach((section) => navObserver.observe(section));

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const target = document.querySelector(anchor.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

function buildEmailUrls({ subject = "Portfolio inquiry", body = "" } = {}) {
  const encodedTo = encodeURIComponent(contactEmail);
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);

  return {
    gmail: `https://mail.google.com/mail/?view=cm&fs=1&to=${encodedTo}&su=${encodedSubject}&body=${encodedBody}`,
    outlook: `https://outlook.live.com/mail/0/deeplink/compose?to=${encodedTo}&subject=${encodedSubject}&body=${encodedBody}`,
  };
}

function openEmailChooser(details) {
  const urls = buildEmailUrls(details);
  if (openGmail) openGmail.href = urls.gmail;
  if (openOutlook) openOutlook.href = urls.outlook;
  emailModal?.classList.add("is-open");
  emailModal?.setAttribute("aria-hidden", "false");
}

function closeChooser() {
  emailModal?.classList.remove("is-open");
  emailModal?.setAttribute("aria-hidden", "true");
}

emailTriggers.forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    openEmailChooser({
      subject: "Portfolio inquiry",
      body: "Hi Chetan,\n\nI visited your portfolio and wanted to connect.",
    });
  });
});

closeEmailDialog?.addEventListener("click", closeChooser);

emailModal?.addEventListener("click", (event) => {
  if (event.target === emailModal) closeChooser();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeChooser();
});

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(contactForm);
  const name = data.get("name");
  const email = data.get("email");
  const subject = data.get("subject");
  const message = data.get("message");
  const body = [`Name: ${name}`, `Email: ${email}`, "", message].join("\n");

  openEmailChooser({ subject, body });
  if (formNote) {
    formNote.textContent = "Choose Gmail or Outlook to open the message.";
  }
});

setThemeIcon();
root.style.setProperty("--loaded", "1");
