// ===================== GRID BACKGROUND =====================
(function initGrid() {
    const canvas = document.getElementById('grid-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, offset = 0;

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const CELL = 60;
    const ACCENT = '0, 229, 160';

    function draw() {
        ctx.clearRect(0, 0, W, H);

        const cols = Math.ceil(W / CELL) + 2;
        const rows = Math.ceil(H / CELL) + 2;
        const ox = offset % CELL;

        // Vertical lines
        for (let c = -1; c < cols; c++) {
            const x = c * CELL - ox;
            const alpha = 0.04 + 0.03 * Math.abs(Math.sin(c * 0.4 + offset * 0.003));
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, H);
            ctx.strokeStyle = `rgba(${ACCENT}, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        // Horizontal lines
        for (let r = -1; r < rows; r++) {
            const y = r * CELL - ox;
            const alpha = 0.04 + 0.03 * Math.abs(Math.sin(r * 0.4 + offset * 0.003));
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(W, y);
            ctx.strokeStyle = `rgba(${ACCENT}, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Glowing intersection dots
        for (let c = -1; c < cols; c++) {
            for (let r = -1; r < rows; r++) {
                const x = c * CELL - ox;
                const y = r * CELL - ox;
                const pulse = 0.5 + 0.5 * Math.sin(offset * 0.008 + c * 0.7 + r * 0.5);
                const alpha = 0.05 + 0.12 * pulse;
                ctx.beginPath();
                ctx.arc(x, y, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${ACCENT}, ${alpha})`;
                ctx.fill();
            }
        }

        // Random glowing cells
        const seed = Math.floor(offset * 0.02);
        for (let i = 0; i < 6; i++) {
            const cc = ((seed * 1337 + i * 521) % cols);
            const rr = ((seed * 919  + i * 317) % rows);
            const x = cc * CELL - ox;
            const y = rr * CELL - ox;
            const fade = 0.5 + 0.5 * Math.sin(offset * 0.05 + i * 2.1);
            const grad = ctx.createRadialGradient(x, y, 0, x, y, CELL * 1.2);
            grad.addColorStop(0, `rgba(${ACCENT}, ${0.12 * fade})`);
            grad.addColorStop(1, `rgba(${ACCENT}, 0)`);
            ctx.fillStyle = grad;
            ctx.fillRect(x - CELL, y - CELL, CELL * 2, CELL * 2);
        }

        offset += 0.4;
        requestAnimationFrame(draw);
    }
    draw();
})();

// ===================== PARTICLE SYSTEM =====================
(function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const COUNT = 55;
    const particles = Array.from({ length: COUNT }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: 0.6 + Math.random() * 2,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -0.15 - Math.random() * 0.3,
        life: Math.random(),
        maxLife: 0.6 + Math.random() * 0.4,
    }));

    let mouseX = W / 2, mouseY = H / 2;
    window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; }, { passive: true });

    function tick() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life += 0.004;
            if (p.life > p.maxLife || p.y < -10) {
                p.x = Math.random() * W;
                p.y = H + 10;
                p.life = 0;
                p.maxLife = 0.6 + Math.random() * 0.4;
                p.vx = (Math.random() - 0.5) * 0.35;
                p.vy = -0.15 - Math.random() * 0.3;
            }
            const t = p.life / p.maxLife;
            const alpha = t < 0.2 ? t / 0.2 : t > 0.8 ? (1 - t) / 0.2 : 1;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0,229,160,${alpha * 0.5})`;
            ctx.fill();
        });

        // Mouse-following orb
        const grd = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 120);
        grd.addColorStop(0, 'rgba(0,229,160,0.04)');
        grd.addColorStop(1, 'rgba(0,229,160,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 120, 0, Math.PI * 2);
        ctx.fill();

        requestAnimationFrame(tick);
    }
    tick();
})();

// ===================== COUNTER ANIMATION =====================
(function initCounters() {
    const counters = document.querySelectorAll('.stat-number[data-target]');
    if (!counters.length) return;

    const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const target = +el.dataset.target;
            let current = 0;
            const step = Math.ceil(target / 40);
            const timer = setInterval(() => {
                current = Math.min(current + step, target);
                el.textContent = current + (target >= 10 ? '+' : '');
                if (current >= target) clearInterval(timer);
            }, 40);
            obs.unobserve(el);
        });
    }, { threshold: 0.5 });

    counters.forEach(c => obs.observe(c));
})();

// ===================== 3D TILT ON PROJECT CARDS =====================
(function initTilt() {
    document.querySelectorAll('.project-card').forEach(card => {
        // Add shine layer
        const shine = document.createElement('div');
        shine.className = 'tilt-shine';
        card.appendChild(shine);

        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top  + rect.height / 2;
            const dx = (e.clientX - cx) / (rect.width / 2);
            const dy = (e.clientY - cy) / (rect.height / 2);
            card.style.transform = `perspective(700px) rotateY(${dx * 8}deg) rotateX(${-dy * 8}deg) translateY(-8px)`;
            shine.style.background = `radial-gradient(circle at ${((e.clientX - rect.left) / rect.width) * 100}% ${((e.clientY - rect.top) / rect.height) * 100}%, rgba(0,229,160,0.18) 0%, transparent 60%)`;
            shine.style.opacity = '1';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            shine.style.opacity = '0';
        });
    });
})();

// ===================== NEON PULSE SKILLS STAGGER =====================
(function initNeonSkills() {
    const pills = document.querySelectorAll('.skill-pill');
    pills.forEach((pill, i) => {
        setTimeout(() => pill.classList.add('neon-active'), i * 200);
    });
})();

// ===================== MOBILE NAV TOOGLE =====================
const menuIcon = document.querySelector('#menu-icon');
const navbar = document.querySelector('.navbar');

if (menuIcon && navbar) {
    menuIcon.onclick = () => {
        menuIcon.classList.toggle('bx-x');
        navbar.classList.toggle('active');
    };
}

document.querySelectorAll('.navbar a').forEach(link => {
    link.addEventListener('click', () => {
        if (navbar && menuIcon) {
            navbar.classList.remove('active');
            menuIcon.classList.remove('bx-x');
        }
    });
});

// ===================== CUSTOM CURSOR — CROSSHAIR + TRAIL =====================
(function initCursor() {
    document.documentElement.style.cursor = 'none';

    // --- Crosshair ---
    const cross = document.createElement('div');
    cross.className = 'cx-cross';
    cross.innerHTML = `
        <div class="cx-h"></div>
        <div class="cx-v"></div>
        <div class="cx-center"></div>
    `;
    document.body.appendChild(cross);

    // --- Trail dots ---
    const TRAIL_COUNT = 14;
    const trail = [];
    for (let i = 0; i < TRAIL_COUNT; i++) {
        const dot = document.createElement('div');
        dot.className = 'cx-trail';
        dot.style.setProperty('--i', i);
        document.body.appendChild(dot);
        trail.push({ el: dot, x: 0, y: 0 });
    }

    let mx = -200, my = -200;

    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    (function loop() {
        cross.style.transform = `translate(${mx}px, ${my}px)`;
        trail[0].x += (mx - trail[0].x) * 0.28;
        trail[0].y += (my - trail[0].y) * 0.28;
        for (let i = 1; i < TRAIL_COUNT; i++) {
            trail[i].x += (trail[i-1].x - trail[i].x) * 0.28;
            trail[i].y += (trail[i-1].y - trail[i].y) * 0.28;
            trail[i].el.style.transform = `translate(${trail[i].x}px, ${trail[i].y}px)`;
        }
        trail[0].el.style.transform = `translate(${trail[0].x}px, ${trail[0].y}px)`;
        requestAnimationFrame(loop);
    })();

    document.querySelectorAll('a, button, .btn, .service-box, .project-card, .skill-pill, .review-card').forEach(el => {
        el.style.cursor = 'none';
        el.addEventListener('mouseenter', () => cross.classList.add('cx-hover'));
        el.addEventListener('mouseleave', () => cross.classList.remove('cx-hover'));
    });

    document.addEventListener('mousedown', () => cross.classList.add('cx-click'));
    document.addEventListener('mouseup',   () => cross.classList.remove('cx-click'));
})();

// ===================== PAGE LOAD ANIMATION =====================
document.addEventListener('DOMContentLoaded', () => {
    // Splash / page-enter
    const splash = document.createElement('div');
    splash.className = 'page-splash';
    splash.innerHTML = `<span class="splash-text">FR</span>`;
    document.body.appendChild(splash);

    setTimeout(() => splash.classList.add('splash-out'), 800);
    setTimeout(() => splash.remove(), 1500);
});

// ===================== TYPING EFFECT =====================
document.addEventListener('DOMContentLoaded', () => {
    const textElement = document.querySelector('.multiple-text');
    if (!textElement) return;

    const words = ['Grafický Dizajnér', 'Web Developer', 'Python Vývojár', 'UI/UX Dizajnér'];
    let wordIndex = 0, charIndex = 0, isDeleting = false;

    function typeEffect() {
        const currentWord = words[wordIndex];
        if (isDeleting) {
            textElement.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
        } else {
            textElement.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
        }
        let typeSpeed = isDeleting ? 45 : 95;
        if (!isDeleting && charIndex === currentWord.length) {
            typeSpeed = 2200; isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typeSpeed = 500;
        }
        setTimeout(typeEffect, typeSpeed);
    }
    typeEffect();
});

// ===================== READ MORE — TYPEWRITER =====================
const readMoreBtn = document.querySelector('.read-more-btn');
const moreText    = document.querySelector('.more-text');

if (readMoreBtn && moreText) {
    const fullText = moreText.textContent.trim();
    let isOpen = false;
    let typingTimer = null;

    readMoreBtn.addEventListener('click', e => {
        e.preventDefault();

        if (!isOpen) {
            // OPEN — typewriter effect
            isOpen = true;
            moreText.textContent = '';
            moreText.classList.add('typing');
            moreText.classList.remove('show');
            readMoreBtn.textContent = 'Čítať menej';
            readMoreBtn.style.opacity = '0.6';
            readMoreBtn.style.pointerEvents = 'none';

            let i = 0;
            const speed = 18; // ms per char

            function typeChar() {
                if (i < fullText.length) {
                    moreText.textContent = fullText.slice(0, i + 1);
                    i++;
                    const delay = fullText[i - 1] === ' ' ? speed * 2.5 :
                                 /[.,!?]/.test(fullText[i - 1]) ? speed * 6 : speed;
                    typingTimer = setTimeout(typeChar, delay);
                } else {
                    moreText.classList.remove('typing');
                    moreText.classList.add('show');
                    readMoreBtn.style.opacity = '';
                    readMoreBtn.style.pointerEvents = '';
                }
            }
            typeChar();
        } else {
            // CLOSE — hide instantly
            isOpen = false;
            clearTimeout(typingTimer);
            moreText.textContent = fullText;
            moreText.classList.remove('show', 'typing');
            readMoreBtn.textContent = 'Čítať viac';
            readMoreBtn.style.opacity = '';
            readMoreBtn.style.pointerEvents = '';
        }
    });
}

// ===================== SCROLL REVEAL =====================
document.addEventListener('DOMContentLoaded', () => {
    const revealMap = [
        { selector: '.home-content',  cls: 'reveal-left'  },
        { selector: '.home-image',    cls: 'reveal-right' },
        { selector: '.about-image',   cls: 'reveal-left'  },
        { selector: '.about-content', cls: 'reveal-right' },
        { selector: '.service-box',   cls: 'reveal'       },
        { selector: '.skill-pill',    cls: 'reveal'       },
        { selector: '.review-card',   cls: 'reveal'       },
        { selector: '.heading',       cls: 'reveal'       },
        { selector: '.contact form',  cls: 'reveal'       },
        { selector: '.footer',        cls: 'reveal'       },
    ];

    const gridSelectors = ['service-box','skill-pill','project-card','review-card'];

    revealMap.forEach(({ selector, cls }) => {
        document.querySelectorAll(selector).forEach((el, i) => {
            el.classList.add(cls);
            if (gridSelectors.some(s => selector.includes(s))) {
                const d = i % 4;
                if (d > 0) el.classList.add(`delay-${d}`);
            }
        });
    });

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                entry.target.classList.remove('visible');
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -80px 0px' });

    document.querySelectorAll('.reveal,.reveal-left,.reveal-right').forEach(el => observer.observe(el));
});

// ===================== SMOOTH SECTION TRANSITIONS =====================
document.querySelectorAll('.navbar a, .gradient-button').forEach(link => {
    link.addEventListener('click', e => {
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) return;
        e.preventDefault();

        const wipe = document.createElement('div');
        wipe.className = 'section-wipe';
        document.body.appendChild(wipe);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => wipe.classList.add('wipe-in'));
        });

        setTimeout(() => {
            const target = document.querySelector(href);
            if (target) target.scrollIntoView({ behavior: 'instant' });
            wipe.classList.remove('wipe-in');
            wipe.classList.add('wipe-out');
            setTimeout(() => wipe.remove(), 500);
        }, 300);
    });
});

// ===================== PARALLAX on HOME IMAGE =====================
const homeImg = document.querySelector('.home-image');
window.addEventListener('mousemove', e => {
    if (!homeImg) return;
    const x = (e.clientX / window.innerWidth  - 0.5) * 18;
    const y = (e.clientY / window.innerHeight - 0.5) * 18;
    homeImg.style.transform = `translate(${x}px, ${y}px)`;
}, { passive: true });

// ===================== MAGNETIC BUTTONS =====================
document.querySelectorAll('.btn, .gradient-button').forEach(btn => {
    btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width  / 2);
        const dy = e.clientY - (rect.top  + rect.height / 2);
        btn.style.transform = `translate(${dx * 0.25}px, ${dy * 0.25}px)`;
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
    });
});

// ===================== COUNTER ANIMATION =====================
function animateCounter(el) {
    const target = +el.dataset.count;
    const duration = 1800;
    const start = performance.now();
    (function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target) + (el.dataset.suffix || '');
        if (progress < 1) requestAnimationFrame(tick);
    })(start);
}
const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); counterObserver.unobserve(e.target); } });
}, { threshold: 0.5 });
document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

// ===================== SKILL PILL RIPPLE =====================
document.querySelectorAll('.skill-pill').forEach(pill => {
    pill.addEventListener('click', e => {
        const ripple = document.createElement('span');
        ripple.className = 'pill-ripple';
        const rect = pill.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.cssText = `
            width: ${size}px; height: ${size}px;
            left: ${e.clientX - rect.left - size / 2}px;
            top:  ${e.clientY - rect.top  - size / 2}px;
        `;
        pill.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });
});

// ===================== PROJECT LIST — HOVER PREVIEW + LIGHTBOX =====================
document.addEventListener('DOMContentLoaded', () => {
    const items       = document.querySelectorAll('.proj-item');
    const preview     = document.getElementById('projPreview');
    const previewImg  = document.getElementById('projPreviewImg');
    const lightbox    = document.getElementById('project-lightbox');
    const lightboxImg   = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const closeBtn    = document.querySelector('.lightbox-close');
    const prevBtn     = document.querySelector('.prev-arrow');
    const nextBtn     = document.querySelector('.next-arrow');
    let currentIndex  = 0;
    let touchStartX   = 0;
    let mouseX = 0, mouseY = 0;
    let previewX = 0, previewY = 0;

    function animatePreview() {
        previewX += (mouseX - previewX) * 0.1;
        previewY += (mouseY - previewY) * 0.1;
        if (preview) {
            preview.style.left = previewX + 'px';
            preview.style.top  = previewY + 'px';
        }
        requestAnimationFrame(animatePreview);
    }
    animatePreview();

    document.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }, { passive: true });

    const projects = Array.from(items).map(item => ({
        img:   item.dataset.img,
        title: item.querySelector('.proj-title') ? item.querySelector('.proj-title').textContent : '',
    }));

    function showLightbox(index, direction = 'none') {
        const p = projects[index];
        if (!p) return;

        if (direction !== 'none' && lightboxImg) {
            lightboxImg.classList.add(direction === 'right' ? 'slide-out-left' : 'slide-out-right');
        }
        setTimeout(() => {
            if (lightboxImg) lightboxImg.src = p.img;
            if (lightboxTitle) lightboxTitle.textContent = p.title;
            if (lightboxImg) {
                lightboxImg.classList.remove('slide-out-left', 'slide-out-right');
                lightboxImg.classList.add(direction === 'right' ? 'slide-in-right' : direction === 'left' ? 'slide-in-left' : '');
                setTimeout(() => lightboxImg.classList.remove('slide-in-right', 'slide-in-left'), 350);
            }
        }, direction !== 'none' ? 220 : 0);

        currentIndex = index;
    }

    items.forEach((item, i) => {
        item.addEventListener('mouseenter', () => {
            if (previewImg && preview && projects[i]) {
                previewImg.src = projects[i].img;
                preview.classList.add('visible');
            }
        });
        item.addEventListener('mouseleave', () => {
            if (preview) preview.classList.remove('visible');
        });
        item.addEventListener('click', () => {
            if (preview) preview.classList.remove('visible');
            showLightbox(i);
            if (lightbox) lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    function closeLightbox() {
        if (lightbox) {
            lightbox.classList.add('closing');
            setTimeout(() => {
                lightbox.classList.remove('active', 'closing');
                document.body.style.overflow = '';
            }, 280);
        }
    }

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (lightbox) lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

    if (prevBtn) prevBtn.addEventListener('click', () => {
        let i = currentIndex - 1;
        if (i < 0) i = projects.length - 1;
        showLightbox(i, 'left');
    });
    if (nextBtn) nextBtn.addEventListener('click', () => {
        let i = (currentIndex + 1) % projects.length;
        showLightbox(i, 'right');
    });

    if (lightbox) {
        lightbox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
        lightbox.addEventListener('touchend', e => {
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) diff > 0 ? nextBtn.click() : prevBtn.click();
        });
    }

    document.addEventListener('keydown', e => {
        if (!lightbox || !lightbox.classList.contains('active')) return;
        if (e.key === 'Escape')     closeLightbox();
        if (e.key === 'ArrowLeft')  prevBtn && prevBtn.click();
        if (e.key === 'ArrowRight') nextBtn && nextBtn.click();
    });

    items.forEach((item, i) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-30px)';
        item.style.transition = `opacity 0.6s ease ${i * 0.07}s, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 0.07}s, padding 0.4s cubic-bezier(0.16,1,0.3,1)`;
    });
    const listObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                items.forEach(item => {
                    item.style.opacity = '1';
                    item.style.transform = '';
                });
                listObs.disconnect();
            }
        });
    }, { threshold: 0.1 });
    const list = document.querySelector('.proj-list');
    if (list) listObs.observe(list);
});

// ===================== ACTIVE NAV LINK ON SCROLL =====================
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.navbar a');

window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    sections.forEach(section => {
        const top    = section.offsetTop - 120;
        const height = section.offsetHeight;
        const id     = section.getAttribute('id');
        if (scrollY >= top && scrollY < top + height) {
            navLinks.forEach(link => {
                link.style.color = '';
                if (link.getAttribute('href') === '#' + id) link.style.color = 'var(--accent)';
            });
        }
    });
}, { passive: true });

// ===================== INJECT TRANSITION STYLES =====================
const styleSheet = document.createElement('style');
styleSheet.textContent = `
/* --- Crosshair cursor --- */
* { cursor: none !important; }
@media (hover: none) { * { cursor: auto !important; } .cx-cross, .cx-trail { display: none !important; } }

.cx-cross {
    position: fixed; pointer-events: none; z-index: 99999;
    width: 0; height: 0;
    top: 0; left: 0;
    transform: translate(-200px, -200px);
}
.cx-h, .cx-v {
    position: absolute;
    background: var(--accent);
    border-radius: 2px;
    transition: width .2s, height .2s, opacity .2s, transform .2s;
}
.cx-h {
    width: 28px; height: 2px;
    top: -1px; left: -14px;
}
.cx-v {
    width: 2px; height: 28px;
    top: -14px; left: -1px;
}
.cx-center {
    position: absolute;
    width: 5px; height: 5px;
    background: var(--accent);
    border-radius: 50%;
    top: -2.5px; left: -2.5px;
    box-shadow: 0 0 8px var(--accent);
    transition: transform .2s, box-shadow .2s;
}

.cx-cross.cx-hover .cx-h { width: 40px; left: -20px; opacity: 0.5; }
.cx-cross.cx-hover .cx-v { height: 40px; top: -20px; opacity: 0.5; }
.cx-cross.cx-hover .cx-center {
    transform: scale(2.5);
    box-shadow: 0 0 18px var(--accent), 0 0 40px rgba(0,229,160,0.4);
}

.cx-cross.cx-click .cx-h  { transform: scaleX(0.4); }
.cx-cross.cx-click .cx-v  { transform: scaleY(0.4); }
.cx-cross.cx-click .cx-center { transform: scale(3.5); opacity: 0.4; }

.cx-trail {
    position: fixed; pointer-events: none; z-index: 99990;
    top: 0; left: 0;
    border-radius: 50%;
    transform: translate(-200px, -200px);
    width:  calc(7px - var(--i) * 0.38px);
    height: calc(7px - var(--i) * 0.38px);
    margin-top:  calc(-3.5px + var(--i) * 0.19px);
    margin-left: calc(-3.5px + var(--i) * 0.19px);
    opacity: calc(0.55 - var(--i) * 0.035);
    background: var(--accent);
    box-shadow: 0 0 6px var(--accent);
}

/* --- Page splash --- */
.page-splash {
    position: fixed; inset: 0; z-index: 99997;
    background: var(--bg, #060810);
    display: flex; align-items: center; justify-content: center;
    transition: opacity .5s ease, transform .5s ease;
}
.splash-text {
    font-family: var(--font-head, 'Syne', sans-serif);
    font-size: 8rem; font-weight: 800;
    background: linear-gradient(135deg, var(--accent, #00e5a0), #7cffd4);
    -webkit-background-clip: text; background-clip: text; color: transparent;
    animation: splashPulse .7s ease forwards;
}
@keyframes splashPulse {
    0%   { opacity: 0; transform: scale(.8); }
    60%  { opacity: 1; transform: scale(1.05); }
    100% { opacity: 1; transform: scale(1); }
}
.page-splash.splash-out {
    opacity: 0; transform: scale(1.06);
    pointer-events: none;
}

/* --- Section wipe --- */
.section-wipe {
    position: fixed; inset: 0; z-index: 9998;
    background: linear-gradient(135deg, var(--accent, #00e5a0) 0%, #7cffd4 100%);
    transform: scaleX(0); transform-origin: left;
    transition: transform .28s cubic-bezier(.77,0,.18,1);
}
.section-wipe.wipe-in { transform: scaleX(1); }
.section-wipe.wipe-out { transform: scaleX(0); transform-origin: right; }

/* --- Lightbox image slide --- */
#lightbox-img {
    transition: transform .25s cubic-bezier(.22,1,.36,1), opacity .25s ease;
}
.slide-out-left  { transform: translateX(-60px) !important; opacity: 0 !important; }
.slide-out-right { transform: translateX(60px)  !important; opacity: 0 !important; }
.slide-in-right  { animation: slideInR .32s cubic-bezier(.22,1,.36,1) forwards; }
.slide-in-left   { animation: slideInL .32s cubic-bezier(.22,1,.36,1) forwards; }
@keyframes slideInR {
    from { transform: translateX(60px); opacity: 0; }
    to   { transform: translateX(0);    opacity: 1; }
}
@keyframes slideInL {
    from { transform: translateX(-60px); opacity: 0; }
    to   { transform: translateX(0);     opacity: 1; }
}
.lightbox.closing { animation: lbClose .28s ease forwards; }
@keyframes lbClose {
    to { opacity: 0; transform: scale(.96); }
}

/* --- Skill ripple --- */
.skill-pill { position: relative; overflow: hidden; }
.pill-ripple {
    position: absolute; border-radius: 50%;
    background: rgba(0,229,160,0.25);
    transform: scale(0);
    animation: rippleAnim .6s linear forwards;
    pointer-events: none;
}
@keyframes rippleAnim {
    to { transform: scale(2.5); opacity: 0; }
}
`;
document.head.appendChild(styleSheet);

// ===================== SCROLL PROGRESS BAR =====================
(function initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const total    = document.body.scrollHeight - window.innerHeight;
        bar.style.width = (scrolled / total * 100) + '%';
    }, { passive: true });
})();

// ===================== SPLIT TEXT REVEAL =====================
(function initSplitText() {
    document.querySelectorAll('.heading').forEach(el => {
        const text = el.innerHTML;
        if (el.querySelector('.word')) return;

        const words = text.split(/(\s+|<[^>]+>)/g);
        let result = '';
        words.forEach(part => {
            if (part.startsWith('<') || /^\s+$/.test(part)) {
                result += part;
            } else if (part.trim()) {
                result += `<span class="word"><span class="inner">${part}</span></span>`;
            }
        });
        el.innerHTML = result;
        el.classList.add('split-reveal');
    });
})();

// ===================== AURORA OPACITY PULSE =====================
(function initAurora() {
    const bands = document.querySelectorAll('.aurora-band');
    bands.forEach((b) => {
        b.style.opacity = '1';
    });
})();

// ===================== PARALLAX SECTIONS =====================
(function initParallaxSections() {
    const parallaxEls = [
        { selector: '.hero-morph-1', speed: 0.05 },
        { selector: '.hero-morph-2', speed: -0.04 },
        { selector: '.aurora-band:nth-child(1)', speed: 0.03 },
        { selector: '.aurora-band:nth-child(2)', speed: -0.02 },
    ];
    const els = parallaxEls.map(p => ({
        el: document.querySelector(p.selector),
        speed: p.speed
    })).filter(p => p.el);

    window.addEventListener('scroll', () => {
        const sy = window.scrollY;
        els.forEach(({ el, speed }) => {
            el.style.transform = `translateY(${sy * speed}px)`;
        });
    }, { passive: true });
})();

// ===================== EXPLOSIVE CLICK BURST =====================
(function initClickBurst() {
    document.addEventListener('click', e => {
        // Generovanie 8 neónových iskier pri kliknutí
        for (let i = 0; i < 8; i++) {
            const spark = document.createElement('div');
            const angle = (i / 8) * Math.PI * 2;
            const dist  = 30 + Math.random() * 50;
            const size  = 3 + Math.random() * 4;
            
            spark.style.cssText = `
                position: fixed;
                left: ${e.clientX}px;
                top: ${e.clientY}px;
                width: ${size}px;
                height: ${size}px;
                background: var(--accent, #00e5a0);
                border-radius: 50%;
                pointer-events: none;
                z-index: 99999;
                box-shadow: 0 0 8px var(--accent, #00e5a0);
                transition: transform 0.6s cubic-bezier(0.1, 0.8, 0.3, 1), opacity 0.6s ease;
                transform: translate(-50%, -50%);
            `;
            
            document.body.appendChild(spark);
            
            // Animácia vystrelenia do strán a plynulé zmiznutie
            requestAnimationFrame(() => {
                const x = Math.cos(angle) * dist;
                const y = Math.sin(angle) * dist;
                spark.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(0)`;
                spark.style.opacity = '0';
            });
            
            // Vyčistenie elementu z DOMu po skončení prechodu
            setTimeout(() => spark.remove(), 600);
        }
    });
})();

// ===================== 3D AVATAR MODEL ANIMATIONS =====================
(function initCharacterAnimations() {
    // 1. HOME AVATAR: Postavička vykukne po jemnom loade
    document.addEventListener("DOMContentLoaded", () => {
        const homeChar = document.getElementById("homeCharacter");
        if (homeChar) {
            setTimeout(() => {
                homeChar.classList.add("peek");
            }, 1200);
        }
    });

    // 2. KONTAKT AVATAR: Spustí sa plynulé kráčanie pri scrollovaní k formuláru
    const contactSection = document.getElementById("contact");
    const contactCharacter = document.getElementById("contactCharacter");
    const contactModel = document.getElementById("contactModel");

    if (contactSection && contactModel) {
        const contactObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Postavička začne "kráčať" na scénu smerom k formuláru (pomocou CSS triedy)
                    if (contactCharacter) {
                        contactCharacter.classList.add("walk-in");
                    }

                    // Keď po 1.5 sekunde dorazí na fixnú pozíciu, zmeníme zdroj na pokojný opierajúci sa model
                    setTimeout(() => {
                        contactModel.src = "image/Leaning Against Wall Talking.glb";
                    }, 1500);

                    // Sledovanie vypneme, aby scéna prebehla iba jedenkrát pri prvom príchode
                    contactObserver.unobserve(contactSection);
                }
            });
        }, { threshold: 0.3 });

        contactObserver.observe(contactSection);
    }
})();