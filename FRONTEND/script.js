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
    loginBtn.addEventListener('click', () => openModal('login'));
    signupBtn.addEventListener('click', () => openModal('signup'));
    if(joinHeroBtn) joinHeroBtn.addEventListener('click', () => openModal('signup'));

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

    // Prevent Form Submission Refresh
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Login functionality mock: Successful!');
        closeModalFunc();
    });

    document.getElementById('signupForm').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Signup functionality mock: Account Created!');
        closeModalFunc();
    });

    // 5. Dynamic Events Data & Filtering
    const eventsData = [
        {
            id: 1,
            title: 'Intro to Google Cloud Platform',
            date: 'Oct 15, 2024',
            time: '2:00 PM - 5:00 PM',
            tag: 'workshop',
            tagColor: 'badge-blue', // Blue
            image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop'
        },
        {
            id: 2,
            title: 'Campus Hackathon 2024',
            date: 'Nov 02 - Nov 03, 2024',
            time: '48 Hours',
            tag: 'hackathon',
            tagColor: 'badge-green', // Green
            image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=600&auto=format&fit=crop'
        },
        {
            id: 3,
            title: 'Building with Gemini API',
            date: 'Nov 12, 2024',
            time: '3:00 PM - 4:30 PM',
            tag: 'seminar',
            tagColor: 'badge-yellow', // Yellow
            image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=600&auto=format&fit=crop'
        },
        {
            id: 4,
            title: 'Android Compose Masterclass',
            date: 'Nov 20, 2024',
            time: '1:00 PM - 4:00 PM',
            tag: 'workshop',
            tagColor: 'badge-red', // Red
            image: 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?q=80&w=600&auto=format&fit=crop'
        }
    ];

    const eventsGrid = document.getElementById('eventsGrid');
    const filterBtns = document.querySelectorAll('.filter-btn');

    const renderEvents = (filter = 'all') => {
        // Clear grid
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
            if(rect.top < window.innerHeight) {
                el.classList.add('visible');
            }
        });
    }, 100);
});
