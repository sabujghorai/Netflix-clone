
/* ============================
   NETFLIX CINEMATIC EXPERIENCE
============================ */

document.addEventListener("DOMContentLoaded", () => {
    const loader = document.getElementById("loader");
    const navbar = document.getElementById("navbar");
    const hero = document.querySelector(".hero");
    const heroVisual = document.getElementById("heroVisual");
    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.querySelector(".nav-links");

    // LOADER
    window.addEventListener("load", () => {
        setTimeout(() => {
            loader?.classList.add("hide");
        }, 900);
    });

    // NAVBAR SCROLL
    function updateNavbar() {
        navbar?.classList.toggle("scrolled", window.scrollY > 50);
    }

    window.addEventListener("scroll", updateNavbar, { passive: true });
    updateNavbar();

    // MOBILE MENU
    menuToggle?.addEventListener("click", () => {
        navLinks?.classList.toggle("open");
    });

    navLinks?.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("open");
        });
    });

    // REVEAL ON SCROLL
    const revealElements = document.querySelectorAll(".reveal");

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px"
    });

    revealElements.forEach(element => revealObserver.observe(element));

    // HERO PARALLAX + POINTER 3D
    if (heroVisual && window.matchMedia("(pointer: fine)").matches) {
        hero.addEventListener("mousemove", (event) => {
            const rect = hero.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;

            heroVisual.style.transform =
                `translateY(-50%) rotateY(${x * 10}deg) rotateX(${-y * 8}deg)`;
        });

        hero.addEventListener("mouseleave", () => {
            heroVisual.style.transform = "translateY(-50%) rotateY(0deg) rotateX(0deg)";
        });
    }

    // 3D POSTER TILT
    const posters = document.querySelectorAll(".movie-poster");

    posters.forEach(poster => {
        poster.addEventListener("mousemove", (event) => {
            if (!window.matchMedia("(pointer: fine)").matches) return;

            const rect = poster.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateY = ((x - centerX) / centerX) * 7;
            const rotateX = ((centerY - y) / centerY) * 7;

            poster.style.transform =
                `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.025)`;
        });

        poster.addEventListener("mouseleave", () => {
            poster.style.transform =
                "perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)";
        });
    });

    // IMMERSIVE IMAGE PARALLAX
    const immersiveImage = document.querySelector(".immersive-bg img");

    window.addEventListener("scroll", () => {
        if (!immersiveImage) return;

        const section = immersiveImage.closest(".immersive");
        const rect = section.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        if (rect.top < viewportHeight && rect.bottom > 0) {
            const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
            const movement = (progress - 0.5) * 90;
            immersiveImage.style.transform = `scale(1.12) translateY(${movement}px)`;
        }
    }, { passive: true });

    // SMOOTH ANCHOR NAVIGATION
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", (event) => {
            const targetId = anchor.getAttribute("href");
            const target = document.querySelector(targetId);

            if (!target) return;

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    });

    // FOOTER BACK TO TOP
    document.querySelector(".back-top")?.addEventListener("click", (event) => {
        event.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    // MOTION PREFERENCE
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        document.documentElement.style.scrollBehavior = "auto";
    }
});
