/**
 * Allcargo Components & Animations (UI ONLY)
 * Handles: Navbar, Footer, Mobile Menu, Cursor, Parallax, Preloader
 */

// 1. Component Loader
async function loadComponent(elementId, componentPath) {
    const element = document.getElementById(elementId);
    if (!element) return;
    try {
        const response = await fetch(componentPath);
        if (response.ok) {
            element.innerHTML = await response.text();
            if (elementId === "navbar-placeholder") {
                highlightActiveLink();
                setupMobileMenu(); 
            }
        }
    } catch (error) { console.error(`Error loading ${componentPath}:`, error); }
}

// 2. Mobile Menu
function setupMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('mobile-menu-close');
    const menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return;
    btn.addEventListener('click', () => menu.classList.remove('translate-x-full'));
    if (closeBtn) closeBtn.addEventListener('click', () => menu.classList.add('translate-x-full'));
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => menu.classList.add('translate-x-full')));
}

// 3. Active Link Highlighter
function highlightActiveLink() {
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    const trackBtn = document.getElementById('nav-track-btn');
    if (trackBtn && currentPath.includes("tracking.html")) {
        trackBtn.style.display = 'none';
    }
    document.querySelectorAll('#navbar-placeholder nav a, #mobile-menu a').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('nav-link-active');
            link.classList.remove('text-slate-300'); 
        }
    });
}

// 4. Scroll Animations
function initStatsAnimation() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                const bar = entry.target.querySelector('.progress-bar-container');
                if (bar) bar.style.width = bar.getAttribute('data-percent');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    document.querySelectorAll('.stat-card').forEach(card => observer.observe(card));
}

// 5. Text Scramble
class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.update = this.update.bind(this);
    }
    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 40);
            this.queue.push({ from, to, start, end });
        }
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }
    update() {
        let output = '';
        let complete = 0;
        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            if (this.frame >= end) { complete++; output += to; } 
            else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) { char = this.randomChar(); this.queue[i].char = char; }
                output += `<span class="opacity-50 text-white">${char}</span>`;
            } else { output += from; }
        }
        this.el.innerHTML = output;
        if (complete === this.queue.length) { this.resolve(); } 
        else { this.frameRequest = requestAnimationFrame(this.update); this.frame++; }
    }
    randomChar() { return this.chars[Math.floor(Math.random() * this.chars.length)]; }
}

function initTypography() {
    const el = document.getElementById('scramble-target');
    if (!el) return;
    const fx = new TextScramble(el);
    const phrases = ['Clarity', 'Precision', 'Confidence', 'Intelligence', 'Allcargo'];
    let counter = 0;
    const next = () => {
        fx.setText(phrases[counter]).then(() => setTimeout(next, 3000));
        counter = (counter + 1) % phrases.length;
    };
    next();
}

// 6. Spotlight & Cursor
function initSpotlight() {
    document.querySelectorAll('.spotlight-card').forEach(card => {
        card.onmousemove = e => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
            card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
        };
    });
}

function initCustomCursor() {
    const dot = document.getElementById("cursor-dot");
    const outline = document.getElementById("cursor-outline");
    if (!dot || !outline) return;
    
    // Default hidden
    dot.style.opacity = "0"; 
    outline.style.opacity = "0";

    window.addEventListener("mousemove", (e) => {
        dot.style.opacity = "1";
        outline.style.opacity = "1";
        const x = e.clientX, y = e.clientY;
        dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
        outline.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    });

    document.addEventListener('mouseover', (e) => {
        if (e.target.closest('a, button, input, .stat-card, details')) {
            document.body.classList.add("cursor-hover");
        } else {
            document.body.classList.remove("cursor-hover");
        }
    });
}

// 7. Page Loader & Parallax
function initPageLoader() {
    const loader = document.getElementById('global-loader');
    if (!loader) return;
    window.addEventListener('load', () => setTimeout(() => loader.classList.add('loader-hidden'), 800));
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link && link.href && link.href.startsWith(window.location.origin) && !link.hash && link.target !== '_blank') {
            e.preventDefault();
            loader.classList.remove('loader-hidden');
            loader.classList.add('loader-active');
            setTimeout(() => window.location.href = link.href, 800);
        }
    });
}

function initParallax() {
    const layers = document.querySelectorAll('.parallax-layer');
    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        layers.forEach(el => {
            const speed = el.getAttribute('data-speed') || 0.5;
            el.style.transform = `translate3d(0, ${-(y * speed)}px, 0)`;
        });
    });
}

function initTypewriter() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const text = el.getAttribute('data-text') || el.innerText;
                el.innerText = '';
                el.classList.add('typewriter-cursor');
                let i = 0;
                function type() {
                    if (i < text.length) { el.innerText += text.charAt(i); i++; setTimeout(type, 50); }
                }
                type();
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    document.querySelectorAll('.typewriter-text').forEach(el => {
        if(!el.getAttribute('data-text')) el.setAttribute('data-text', el.innerText);
        el.innerText = '';
        observer.observe(el);
    });
}

// --- MASTER INIT ---
document.addEventListener("DOMContentLoaded", () => {
    loadComponent("navbar-placeholder", "components/navbar.html");
    loadComponent("footer-placeholder", "components/footer.html");
    initStatsAnimation();
    initTypography();
    initSpotlight();
    initCustomCursor();
    initPageLoader();
    initParallax();
    initTypewriter();
});

// --- REAL-TIME REAL WORLD VISITOR TRACKER ---
(async function trackRealUser() {
    const visitorKey = "allcargo_visitors";
    const pageName = window.location.pathname.split("/").pop() || "index.html";
    const timestamp = new Date().toLocaleTimeString();

    let ipData = { ip: "Unknown", city: "Unknown", country: "Unknown" };

    try {
        // 1. Fetch Real Data from free IP API
        // This asks the internet: "Where is this user coming from?"
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        ipData = {
            ip: data.ip || "Anonymous",
            city: data.city || "Unknown City",
            country: data.country_code || "UNK"
        };

    } catch (error) {
        console.log("Adblocker or Offline: Using fallback data");
        // Fallback if API is blocked
        ipData = { ip: "127.0.0.1", city: "Hidden", country: "LOC" };
    }

    // 2. Format the Location String
    const locationString = `${ipData.city}, ${ipData.country}`;

    const visitData = {
        ip: ipData.ip,
        location: locationString,
        page: pageName,
        time: timestamp,
        status: "Active"
    };

    // 3. Save to Shared Notebook (LocalStorage)
    let history = JSON.parse(localStorage.getItem(visitorKey) || "[]");
    
    // Prevent duplicate logs for the same page refresh within 5 seconds
    if(history.length > 0) {
        const last = history[0];
        if(last.ip === visitData.ip && last.page === visitData.page && last.location === visitData.location) {
            // Update time only, don't add new row
            history[0].time = timestamp;
            localStorage.setItem(visitorKey, JSON.stringify(history));
            return;
        }
    }

    history.unshift(visitData); // Add to top
    if (history.length > 20) history.pop(); // Keep list clean
    localStorage.setItem(visitorKey, JSON.stringify(history));

})();