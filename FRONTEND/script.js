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
});
