const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://gdg-challenge-1-fvsh.onrender.com/api'; // Render URL

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const header = document.querySelector('header');

    mobileMenuBtn.addEventListener('click', () => {
        header.classList.toggle('mobile-menu-open');
    });

    // Close mobile menu when a link is clicked
    const navLinks = document.querySelectorAll('.nav-links a, .auth-buttons button');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            header.classList.remove('mobile-menu-open');
        });
    });

    // 2. Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 3. Scroll Animations (Intersection Observer)
    const fadeElements = document.querySelectorAll('.fade-in-up, .scroll-animate');

    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once animated
                // fadeObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    fadeElements.forEach(el => fadeObserver.observe(el));

    // 4. Modal Logic
    const authModal = document.getElementById('authModal');
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const joinHeroBtn = document.getElementById('joinHeroBtn');
    const closeModal = document.getElementById('closeModal');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // Open Modal Functions
    const openModal = (tab = 'login') => {
        authModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
        switchTab(tab);
    };

    // Close Modal
    const closeModalFunc = () => {
        authModal.classList.remove('active');
        document.body.style.overflow = 'auto'; // Restore scrolling
    };

    // Event Listeners for Opening Modal
    if (loginBtn) loginBtn.addEventListener('click', () => openModal('login'));
    if (signupBtn) signupBtn.addEventListener('click', () => openModal('signup'));
    if (joinHeroBtn) joinHeroBtn.addEventListener('click', () => openModal('signup'));

    // Event Listeners for Closing Modal
    closeModal.addEventListener('click', closeModalFunc);
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) {
            closeModalFunc();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && authModal.classList.contains('active')) {
            closeModalFunc();
        }
    });

    // Tab Switching Logic
    const switchTab = (tabId) => {
        // Update Buttons
        tabBtns.forEach(btn => {
            if (btn.dataset.tab === tabId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Update Content
        tabContents.forEach(content => {
            if (content.id === `${tabId}-tab`) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
    };

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });

    // Check Authentication state
    const updateAuthUI = () => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        const authButtonsContainer = document.querySelector('.auth-buttons');

        if (token && userStr) {
            const user = JSON.parse(userStr);
            authButtonsContainer.innerHTML = `
                <span style="margin-right: 15px; font-weight: 500;">Hi, ${user.name.split(' ')[0]}</span>
                <button id="logoutBtn" class="btn btn-outline">Logout</button>
            `;
            document.getElementById('logoutBtn').addEventListener('click', () => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                updateAuthUI();
            });
            if (joinHeroBtn) joinHeroBtn.style.display = 'none';
        } else {
            authButtonsContainer.innerHTML = `
                <button id="loginBtn" class="btn btn-outline">Login</button>
                <button id="signupBtn" class="btn btn-primary">Sign Up</button>
            `;
            document.getElementById('loginBtn').addEventListener('click', () => openModal('login'));
            document.getElementById('signupBtn').addEventListener('click', () => openModal('signup'));
            if (joinHeroBtn) joinHeroBtn.style.display = 'inline-flex';
        }
    };

    updateAuthUI();

    // Authentication Forms Submission
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                updateAuthUI();
                closeModalFunc();
                loginForm.reset();
            } else {
                alert(data.msg || 'Login failed');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred during login');
        }
    });

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;

        try {
            const res = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                updateAuthUI();
                closeModalFunc();
                signupForm.reset();
            } else {
                alert(data.msg || 'Signup failed');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred during signup');
        }
    });

    // 5. Dynamic Events Data & Filtering
    let eventsData = [];

    const eventsGrid = document.getElementById('eventsGrid');
    const filterBtns = document.querySelectorAll('.filter-btn');

    const renderEvents = async (filter = 'all') => {
        // Clear grid and show loading state if eventsData is empty
        if (eventsData.length === 0) {
            eventsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Loading events...</p>';
            try {
                const res = await fetch(`${API_URL}/events`);
                if (res.ok) {
                    eventsData = await res.json();
                } else {
                    eventsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">Failed to load events.</p>';
                    return;
                }
            } catch (err) {
                console.error('Error fetching events:', err);
                eventsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">Error connecting to server.</p>';
                return;
            }
        }

        eventsGrid.innerHTML = '';

        // Filter elements
        const filteredEvents = filter === 'all'
            ? eventsData
            : eventsData.filter(event => event.tag === filter);

        if (filteredEvents.length === 0) {
            eventsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">No events found in this category.</p>';
            return;
        }

        // Render HTML
        filteredEvents.forEach((event, index) => {
            const delay = (index % 3) * 0.1; // Stagger animation
            const eventHtml = `
                <div class="event-card fade-in-up visible" style="transition-delay: ${delay}s">
                    <img src="${event.image}" alt="${event.title}" class="event-image">
                    <div class="event-details">
                        <span class="event-badge ${event.tagColor}">${event.tag.toUpperCase()}</span>
                        <h3 class="event-title">${event.title}</h3>
                        <div class="event-meta">
                            <span>📅 ${event.date}</span>
                            <span>⏰ ${event.time}</span>
                        </div>
                        <button class="btn btn-outline btn-full" onclick="alert('Viewing details for ${event.title}')">View Details</button>
                    </div>
                </div>
            `;
            eventsGrid.insertAdjacentHTML('beforeend', eventHtml);
        });
    };

    // Filter Buttons Event Listeners
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add to current
            btn.classList.add('active');
            // Re-render
            renderEvents(btn.dataset.filter);
        });
    });

    // Initial Render
    // Use a slight timeout to ensure CSS is loaded and animations run smoothly
    setTimeout(() => {
        renderEvents();

        // Ensure initial elements in viewport trigger animation
        document.querySelectorAll('.fade-in-up').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
                el.classList.add('visible');
            }
        });
    }, 100);
    // 7. Theme Toggle Logic
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const sunIcon = themeToggleBtn.querySelector('.sun-icon');
    const moonIcon = themeToggleBtn.querySelector('.moon-icon');

    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    }

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
            initParticles(); // Re-init particles for light mode
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
            initParticles(); // Re-init particles for dark mode
        }
    });

    // 8. Particle Network Animation
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    let particlesArray;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let mouse = {
        x: null,
        y: null,
        radius: (canvas.height / 80) * (canvas.width / 80)
    };

    window.addEventListener('mousemove',
        function (event) {
            mouse.x = event.x;
            mouse.y = event.y;
        }
    );

    window.addEventListener('resize',
        function () {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            mouse.radius = (canvas.height / 80) * (canvas.width / 80);
            initParticles();
        }
    );

    window.addEventListener('mouseout',
        function () {
            mouse.x = undefined;
            mouse.y = undefined;
        }
    );

    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
            this.color = color;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
        update() {
            if (this.x > canvas.width || this.x < 0) {
                this.directionX = -this.directionX;
            }
            if (this.y > canvas.height || this.y < 0) {
                this.directionY = -this.directionY;
            }

            // collision detection with mouse
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < mouse.radius + this.size) {
                if (mouse.x < this.x && this.x < canvas.width - this.size * 10) {
                    this.x += 10;
                }
                if (mouse.x > this.x && this.x > this.size * 10) {
                    this.x -= 10;
                }
                if (mouse.y < this.y && this.y < canvas.height - this.size * 10) {
                    this.y += 10;
                }
                if (mouse.y > this.y && this.y > this.size * 10) {
                    this.y -= 10;
                }
            }
            this.x += this.directionX;
            this.y += this.directionY;
            this.draw();
        }
    }

    function initParticles() {
        particlesArray = [];
        let numberOfParticles = (canvas.height * canvas.width) / 9000;
        const pColor = document.documentElement.getAttribute('data-theme') === 'dark' ? 'rgba(66, 133, 244, 0.4)' : 'rgba(66, 133, 244, 0.2)';

        for (let i = 0; i < numberOfParticles; i++) {
            let size = (Math.random() * 3) + 1;
            let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
            let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
            let directionX = (Math.random() * 2) - 1;
            let directionY = (Math.random() * 2) - 1;

            particlesArray.push(new Particle(x, y, directionX, directionY, size, pColor));
        }
    }

    function animateParticles() {
        requestAnimationFrame(animateParticles);
        ctx.clearRect(0, 0, innerWidth, innerHeight);

        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        connectParticles();
    }

    function connectParticles() {
        let opacityValue = 1;
        const lineColor = document.documentElement.getAttribute('data-theme') === 'dark' ? '66, 133, 244' : '66, 133, 244';
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x)) +
                    ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
                if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                    opacityValue = 1 - (distance / 20000);
                    ctx.strokeStyle = `rgba(${lineColor},${opacityValue * 0.2})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    initParticles();
    animateParticles();
});
