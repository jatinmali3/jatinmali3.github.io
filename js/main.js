const navToggle = document.getElementById("navToggle");
const siteNav = document.getElementById("siteNav");
const navLinks = document.querySelectorAll(".nav-link");
const themeToggle = document.getElementById("themeToggle");
const siteHeader = document.getElementById("siteHeader");
const body = document.body;

/* ── Mobile overlay nav ── */
const mobileNavOverlay = document.getElementById("mobileNavOverlay");
const mobBackdrop = document.getElementById("mobBackdrop");
const mobClose = document.getElementById("mobClose");
const mobNavLinks = document.querySelectorAll(".mob-nav-link");
const mobYear = document.getElementById("mobYear");
if (mobYear) mobYear.textContent = new Date().getFullYear();

function openMobileNav() {
    mobileNavOverlay.classList.add("open");
    mobileNavOverlay.setAttribute("aria-hidden", "false");
    navToggle.setAttribute("aria-expanded", "true");
    body.style.overflow = "hidden";
}

function closeMobileNav() {
    mobileNavOverlay.classList.remove("open");
    mobileNavOverlay.setAttribute("aria-hidden", "true");
    navToggle.setAttribute("aria-expanded", "false");
    body.style.overflow = "";
}

navToggle.addEventListener("click", () => {
    const isOpen = mobileNavOverlay.classList.contains("open");
    isOpen ? closeMobileNav() : openMobileNav();
});

if (mobClose) mobClose.addEventListener("click", closeMobileNav);
if (mobBackdrop) mobBackdrop.addEventListener("click", closeMobileNav);

mobNavLinks.forEach((link) => {
    link.addEventListener("click", () => {
        closeMobileNav();
        /* sync active state to desktop nav too */
        const href = link.getAttribute("href");
        navLinks.forEach(nl => nl.classList.toggle("active", nl.getAttribute("href") === href));
    });
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileNavOverlay.classList.contains("open")) closeMobileNav();
});

window.addEventListener("scroll", () => {
    if (window.scrollY > 20) {
        siteHeader.classList.add("scrolled");
    } else {
        siteHeader.classList.remove("scrolled");
    }
});

const sections = [...document.querySelectorAll("main section[id]")];
const sectionObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }
            const id = entry.target.getAttribute("id");
            navLinks.forEach((link) => {
                const isMatch = link.getAttribute("href") === `#${id}`;
                link.classList.toggle("active", isMatch);
            });
        });
    }, { threshold: 0.3 }
);

sections.forEach((section) => sectionObserver.observe(section));

function applyTheme(theme) {
    const isLight = theme === "light";
    body.classList.toggle("light-mode", isLight);
    document.documentElement.setAttribute("data-theme", theme);
}

const savedTheme = localStorage.getItem("portfolio-theme") || "dark";
applyTheme(savedTheme);

themeToggle.addEventListener("click", () => {
    const nextTheme = body.classList.contains("light-mode") ? "dark" : "light";
    applyTheme(nextTheme);
    localStorage.setItem("portfolio-theme", nextTheme);
});

const yearNode = document.getElementById("year");
yearNode.textContent = `${new Date().getFullYear()}`;

const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const sendBtn = document.getElementById("sendBtn");
const btnLabel = document.getElementById("btnLabel");

// ─── EmailJS Configuration ──────────────────────────────────────────────────
// 1. Sign up free at https://www.emailjs.com
// 2. Add an email service (Gmail, Outlook, etc.) and copy your Service ID
// 3. Create an email template — use these variable names in your template:
//      {{from_name}}   {{from_email}}   {{subject}}   {{message}}
//    Then copy your Template ID.
// 4. Go to Account → API Keys and copy your Public Key.
// Replace the three strings below with your real values:
const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID"; // e.g. "service_abc1234"
const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID"; // e.g. "template_xyz5678"
const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY"; // e.g. "AbCdEfGhIjK_lMnOp"
// ────────────────────────────────────────────────────────────────────────────

if (typeof emailjs !== "undefined" && EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY") {
    emailjs.init(EMAILJS_PUBLIC_KEY);
}

/* ─── Validation helpers ───────────────────────────────────────────────── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const FORM_FIELDS = [
    { id: "cfName", test: v => v.length >= 2, msg: "Please enter your name (at least 2 characters)." },
    { id: "cfEmail", test: v => EMAIL_RE.test(v), msg: "Please enter a valid email address." },
    { id: "cfSubject", test: v => v.length >= 2, msg: "Please enter a subject." },
    { id: "cfMessage", test: v => v.length >= 10, msg: "Message must be at least 10 characters." },
];

function validateForm() {
    let allValid = true;
    FORM_FIELDS.forEach(({ id, test, msg }) => {
        const el = document.getElementById(id);
        const wrap = el.closest(".floating-field");
        const err = wrap.querySelector(".field-error");
        const val = el.value.trim();

        if (!test(val)) {
            wrap.classList.add("has-error");
            wrap.classList.remove("is-valid");
            err.textContent = msg;
            allValid = false;
        } else {
            wrap.classList.remove("has-error");
            wrap.classList.add("is-valid");
            err.textContent = "";
        }
    });
    return allValid;
}

/* clear error on input so user gets instant feedback after correction */
FORM_FIELDS.forEach(({ id, test }) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", () => {
        const wrap = el.closest(".floating-field");
        const err = wrap.querySelector(".field-error");
        const val = el.value.trim();
        if (test(val)) {
            wrap.classList.remove("has-error");
            wrap.classList.add("is-valid");
            err.textContent = "";
        }
    });
});

/* ─── Helper: remove is-valid class safely (avoids optional chaining that formatters break) ── */
function clearValid(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var wrap = el.closest(".floating-field");
    if (wrap) wrap.classList.remove("is-valid");
}
// Max 3 submissions per hour per browser to limit API credit misuse
function checkRateLimit() {
    const KEY = "cf_subs";
    const LIMIT = 3;
    const WINDOW = 60 * 60 * 1000; // 1 hour in ms
    const now = Date.now();
    let log = JSON.parse(localStorage.getItem(KEY) || "[]");
    log = log.filter(t => now - t < WINDOW); // drop entries older than 1 hour
    if (log.length >= LIMIT) return false; // rate-limited
    log.push(now);
    localStorage.setItem(KEY, JSON.stringify(log));
    return true;
}

/* ─── Submit handler ────────────────────────────────────────────────────── */
contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formStatus.className = "form-status";
    formStatus.textContent = "";

    /* 1 — honeypot: if the hidden _hp field has any value, a bot filled it */
    const hp = contactForm.querySelector("input[name='_hp']");
    if (hp && hp.value) return; // silently discard

    /* 2 — field validation */
    if (!validateForm()) {
        formStatus.className = "form-status error";
        formStatus.textContent = "Please fix the errors above before sending.";
        /* scroll the first error into view */
        const firstErr = contactForm.querySelector(".has-error input, .has-error textarea");
        if (firstErr) firstErr.focus();
        return;
    }

    /* 3 — rate limit */
    if (!checkRateLimit()) {
        formStatus.className = "form-status error";
        formStatus.textContent = "Too many messages sent. Please wait an hour before trying again.";
        return;
    }

    /* 4 — demo mode (no credentials yet) */
    if (EMAILJS_PUBLIC_KEY === "YOUR_PUBLIC_KEY") {
        formStatus.className = "form-status success";
        formStatus.textContent = "✓ Message captured! Add your EmailJS credentials in js/main.js to send real emails.";
        contactForm.reset();
        FORM_FIELDS.forEach(function(f) { clearValid(f.id); });
        setTimeout(() => { formStatus.textContent = ""; }, 6000);
        return;
    }

    /* 5 — send via EmailJS */
    sendBtn.disabled = true;
    btnLabel.textContent = "Sending…";

    emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, contactForm)
        .then(() => {
            formStatus.className = "form-status success";
            formStatus.textContent = "✓ Message sent! I'll get back to you soon.";
            contactForm.reset();
            FORM_FIELDS.forEach(function(f) { clearValid(f.id); });
        })
        .catch((err) => {
            formStatus.className = "form-status error";
            formStatus.textContent = "✗ Something went wrong. Please email me directly.";
            console.error("EmailJS error:", err);
        })
        .finally(() => {
            sendBtn.disabled = false;
            btnLabel.textContent = "Send Message";
            setTimeout(() => { formStatus.textContent = ""; }, 6000);
        });
});