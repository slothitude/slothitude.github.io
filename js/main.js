/* ============================================
   SlothitudeGames Portfolio — Main JavaScript
   Intersection Observer, nav highlighting,
   parallax hero, hover effects, loading states
   ============================================ */

(function () {
    'use strict';

    // ---- Loading Screen ----
    const loader = document.getElementById('loader');

    function hideLoader() {
        if (!loader) return;
        loader.classList.add('hidden');
        document.body.style.overflow = '';
        // Remove loader from DOM after transition
        setTimeout(() => loader.remove(), 600);
    }

    // Hide loader when page is ready (or after max 3s fallback)
    window.addEventListener('load', () => setTimeout(hideLoader, 400));
    setTimeout(hideLoader, 3000);

    // ---- Intersection Observer for Scroll Reveals ----
    function initScrollReveal() {
        const reveals = document.querySelectorAll('.reveal');
        if (!reveals.length) return;

        // Respect reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            reveals.forEach(el => el.classList.add('active'));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                        // Once revealed, stop observing
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -40px 0px'
            }
        );

        reveals.forEach(el => observer.observe(el));
    }

    // ---- Smooth Nav Highlighting on Scroll ----
    function initNavHighlighting() {
        const navLinks = document.querySelectorAll('.nav-link[data-section]');
        const sections = document.querySelectorAll('section[id]');
        const navbar = document.getElementById('navbar');

        if (!navLinks.length || !sections.length) return;

        // Track which section is currently visible
        const sectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.id;
                        navLinks.forEach(link => {
                            link.classList.toggle('active', link.dataset.section === id);
                        });
                    }
                });
            },
            {
                threshold: 0.3,
                rootMargin: `-${parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 70}px 0px -30% 0px`
            }
        );

        sections.forEach(section => sectionObserver.observe(section));

        // Navbar background on scroll
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    if (navbar) {
                        navbar.classList.toggle('scrolled', window.scrollY > 50);
                    }
                    ticking = false;
                });
                ticking = true;
            }
        });

        // Smooth scroll for nav links
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const target = document.querySelector(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                    // Close mobile nav if open
                    closeMobileNav();
                }
            });
        });
    }

    // ---- Mobile Navigation Toggle ----
    function initMobileNav() {
        const toggle = document.querySelector('.nav-toggle');
        const navLinks = document.querySelector('.nav-links');
        if (!toggle || !navLinks) return;

        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            navLinks.classList.toggle('open');
            document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!toggle.contains(e.target) && !navLinks.contains(e.target)) {
                closeMobileNav();
            }
        });
    }

    function closeMobileNav() {
        const toggle = document.querySelector('.nav-toggle');
        const navLinks = document.querySelector('.nav-links');
        if (toggle) toggle.classList.remove('active');
        if (navLinks) navLinks.classList.remove('open');
        document.body.style.overflow = '';
    }

    // ---- Parallax Hero Section ----
    function initParallax() {
        const heroBg = document.querySelector('.hero-bg[data-parallax]');
        if (!heroBg) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const speed = parseFloat(heroBg.dataset.parallax) || 0.3;
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrolled = window.scrollY;
                    const heroHeight = document.querySelector('.hero')?.offsetHeight || window.innerHeight;

                    // Only apply parallax while hero is visible
                    if (scrolled < heroHeight) {
                        heroBg.style.transform = `translateY(${scrolled * speed}px)`;
                    }
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // ---- Project Card Hover Effects ----
    function initProjectHoverEffects() {
        const cards = document.querySelectorAll('.project-card');

        cards.forEach(card => {
            const inner = card.querySelector('.project-card-inner');
            if (!inner) return;

            // 3D tilt effect on mouse move
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((y - centerY) / centerY) * -4;
                const rotateY = ((x - centerX) / centerX) * 4;

                inner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
            });

            card.addEventListener('mouseleave', () => {
                inner.style.transform = '';
            });
        });
    }

    // ---- Project Filter ----
    function initProjectFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const projectCards = document.querySelectorAll('.project-card');
        if (!filterBtns.length || !projectCards.length) return;

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;

                // Update active button
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Filter cards
                projectCards.forEach(card => {
                    const tags = (card.dataset.tags || '').toLowerCase().split(' ');
                    if (filter === 'all' || tags.includes(filter)) {
                        card.classList.remove('filtered-out');
                        // Re-trigger reveal animation
                        card.classList.remove('active');
                        requestAnimationFrame(() => {
                            card.classList.add('active');
                        });
                    } else {
                        card.classList.add('filtered-out');
                    }
                });
            });
        });
    }

    // ---- Stat Counter Animation ----
    function initStatCounters() {
        const statNumbers = document.querySelectorAll('.stat-number[data-count]');
        if (!statNumbers.length) return;

        const counterObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        counterObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.5 }
        );

        statNumbers.forEach(el => counterObserver.observe(el));
    }

    function animateCounter(element) {
        const target = parseInt(element.dataset.count, 10);
        const duration = 1500;
        const start = performance.now();

        function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(eased * target);

            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    // ---- Hero Particles ----
    function initParticles() {
        const container = document.getElementById('particles');
        if (!container) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const count = 20;

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${60 + Math.random() * 40}%`;
            particle.style.width = `${1 + Math.random() * 2}px`;
            particle.style.height = particle.style.width;
            particle.style.animationDuration = `${8 + Math.random() * 12}s`;
            particle.style.animationDelay = `${Math.random() * 10}s`;
            particle.style.opacity = '0';
            container.appendChild(particle);
        }
    }

    // ---- Smooth Scroll for Hero CTA Buttons ----
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                // Skip if already handled by nav highlighting
                if (anchor.classList.contains('nav-link')) return;

                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    // ---- Initialize Everything ----
    function init() {
        initScrollReveal();
        initNavHighlighting();
        initMobileNav();
        initParallax();
        initProjectHoverEffects();
        initProjectFilters();
        initStatCounters();
        initParticles();
        initSmoothScroll();
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
