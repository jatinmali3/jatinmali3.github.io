/* Typing Animation */
const typingText = document.getElementById("typingText");
const roles = [
    "Frontend Developer",
    "WordPress Developer",
    "Responsive Web Designer",
];

let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeLoop() {
    if (!typingText) return;
    const currentRole = roles[roleIndex];
    const visibleText = currentRole.slice(0, charIndex);
    typingText.textContent = `${visibleText}_`;

    if (!isDeleting && charIndex < currentRole.length) {
        charIndex += 1;
        setTimeout(typeLoop, 80);
        return;
    }

    if (!isDeleting && charIndex === currentRole.length) {
        isDeleting = true;
        setTimeout(typeLoop, 1500);
        return;
    }

    if (isDeleting && charIndex > 0) {
        charIndex -= 1;
        setTimeout(typeLoop, 40);
        return;
    }

    isDeleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    setTimeout(typeLoop, 400);
}

typeLoop();

/* Scroll Progress Bar */
const progressBar = document.getElementById("progressBar");
window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const progress = total > 0 ? (scrollTop / total) * 100 : 0;
    if (progressBar) progressBar.style.width = `${progress}%`;
});

/* Custom Cursor */
const dot = document.getElementById("cursorDot");
const ring = document.getElementById("cursorRing");

let mouseX = 0;
let mouseY = 0;
let ringX = 0;
let ringY = 0;

window.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    if (dot) {
        dot.style.left = `${mouseX}px`;
        dot.style.top = `${mouseY}px`;
    }
});

function animateCursor() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    if (ring) {
        ring.style.left = `${ringX}px`;
        ring.style.top = `${ringY}px`;
    }
    requestAnimationFrame(animateCursor);
}

animateCursor();

const hoverTargets = document.querySelectorAll("a, button, .skill-pill, .project-card, .timeline-content");
hoverTargets.forEach((target) => {
    target.addEventListener("mouseenter", () => {
        if (ring) {
            ring.style.width = "60px";
            ring.style.height = "60px";
            ring.style.backgroundColor = "rgba(255,255,255,0.1)";
            ring.style.borderColor = "transparent";
        }
    });
    target.addEventListener("mouseleave", () => {
        if (ring) {
            ring.style.width = "40px";
            ring.style.height = "40px";
            ring.style.backgroundColor = "transparent";
            ring.style.borderColor = "rgba(255, 255, 255, 0.4)";
        }
    });
});

/* GSAP Animations */
document.addEventListener("DOMContentLoaded", () => {
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
        gsap.registerPlugin(ScrollTrigger);

        // Initial Hero Animation
        const heroTimeline = gsap.timeline();

        heroTimeline.fromTo(".hero-copy > *", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" })
            .fromTo(".hero-visual", { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 1, ease: "power3.out" },
                "-=0.6"
            );

        // Scroll reveals for sections
        const revealElements = gsap.utils.toArray(".gs-reveal");
        revealElements.forEach((elem) => {
            gsap.fromTo(elem, { autoAlpha: 0, y: 30 }, {
                duration: 0.8,
                autoAlpha: 1,
                y: 0,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: elem,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            });
        });

        // About section image subtle parallax
        gsap.to(".about-image img", {
            yPercent: 15,
            ease: "none",
            scrollTrigger: {
                trigger: ".about-image",
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });
    } else {
        // Fallback if GSAP fails to load
        const fallbackReveal = document.querySelectorAll(".gs-reveal");
        fallbackReveal.forEach(el => {
            el.style.visibility = "visible";
            el.style.opacity = "1";
        });
    }
});