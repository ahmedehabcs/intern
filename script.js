// ================== Theme ==================
const themeToggle = document.getElementById('themeToggle');
function getInitialTheme() {
    const saved = localStorage.getItem('nexa-theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nexa-theme', theme);
}
applyTheme(getInitialTheme());
themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
});

// ================== Mobile navigation ==================
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
function setMenu(open) {
    hamburger.classList.toggle('open', open);
    mobileMenu.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    mobileMenu.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
}
hamburger.addEventListener('click', () => setMenu(!mobileMenu.classList.contains('open')));
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('click', (e) => {
    if (mobileMenu.classList.contains('open') &&
        !mobileMenu.contains(e.target) &&
        !hamburger.contains(e.target)) {
        setMenu(false);
    }
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

// ================== Scroll navigation ==================
const navWrap = document.getElementById('navWrap');
const navLinks = document.querySelectorAll('.nav-link, .mobile-link');
const sections = Array.from(document.querySelectorAll('main section[id]'));

window.addEventListener('scroll', () => {
    navWrap.classList.toggle('scrolled', window.scrollY > 20);
    updateActiveLink();
    toggleBackToTop();
}, { passive: true });

function updateActiveLink() {
    const scrollPos = window.scrollY + 120;
    let current = 'home';
    for (const section of sections) {
        if (section.offsetTop <= scrollPos) current = section.id;
    }
    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
}

// ================== Counters ==================
const counters = document.querySelectorAll('.counter');
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.4 });
counters.forEach(c => counterObserver.observe(c));

function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();
    function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

// ================== Contact form ==================
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');

function showError(name, msg) {
    const field = contactForm.querySelector(`[name="${name}"]`).closest('.field');
    const err = field.querySelector('.error');

    field.classList.add('invalid');
    err.textContent = msg;
}

function clearError(name) {
    const field = contactForm.querySelector(`[name="${name}"]`).closest('.field');

    field.classList.remove('invalid');
    field.querySelector('.error').textContent = '';
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    ['fullName', 'email', 'message', 'consent'].forEach(clearError);

    let ok = true;

    const name = contactForm.querySelector('[name="fullName"]').value.trim();
    const email = contactForm.querySelector('[name="email"]').value.trim();
    const message = contactForm.querySelector('[name="message"]').value.trim();
    const consent = contactForm.querySelector('#consent').checked;

    if (!name) {
        showError('fullName', 'Please enter your name.');
        ok = false;
    }

    if (!email) {
        showError('email', 'Please enter your email.');
        ok = false;
    } else if (!validateEmail(email)) {
        showError('email', 'Please enter a valid email address.');
        ok = false;
    }

    if (!message) {
        showError('message', 'Please write a short message.');
        ok = false;
    } else if (message.length < 20) {
        showError('message', 'Message must be at least 20 characters.');
        ok = false;
    }

    if (!consent) {
        showError('consent', 'Please confirm your consent.');
        ok = false;
    }

    if (!ok) return;

    const data = {
        name: name,
        email: email,
        message: message,
        consent: consent
    };

    console.log(data);

    submitBtn.disabled = true;
    submitBtn.classList.add('loading');

    try {
        await new Promise((resolve) => setTimeout(resolve, 1400));
        const res = await fetch("http://localhost:3131/api/contact", {
            method: 'POST',
            headers: {
                "Content-Type": 'application/json',
            },
            body: JSON.stringify(data)
        })

        if (!res.ok) {
            showToast('Something went wrong. Please try again.', 'error');
            return;
        }
        showToast('Your message has been sent successfully. We will contact you soon.', 'success');
        contactForm.reset();
    } catch (error) {
        console.error(error);
        showToast('Something went wrong. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
    }
});

['fullName', 'email', 'message'].forEach((name) => {
    const input = contactForm.querySelector(`[name="${name}"]`);

    input.addEventListener('input', () => clearError(name));
    input.addEventListener('change', () => clearError(name));
});

contactForm.querySelector('#consent').addEventListener('change', () => {
    clearError('consent');
});

// ================== Toasts ==================
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => { toast.classList.add('fade-out'); setTimeout(() => toast.remove(), 350); }, 4200);
}

// ================== Scroll reveal ==================
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ================== Back to top ==================
const backToTop = document.getElementById('backToTop');
function toggleBackToTop() { backToTop.classList.toggle('show', window.scrollY > 500); }
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ================== Footer year ==================
document.getElementById('year').textContent = new Date().getFullYear();
