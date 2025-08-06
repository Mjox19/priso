// DOM Elements
const header = document.getElementById('header');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileNav = document.getElementById('mobileNav');
const menuIcon = document.getElementById('menuIcon');
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const portfolioGrid = document.getElementById('portfolioGrid');

// Mobile Menu Toggle
let isMenuOpen = false;

mobileMenuBtn.addEventListener('click', () => {
    isMenuOpen = !isMenuOpen;
    mobileNav.classList.toggle('active', isMenuOpen);
    menuIcon.className = isMenuOpen ? 'fas fa-times' : 'fas fa-bars';
});

// Close mobile menu when clicking on links
document.querySelectorAll('.nav-link-mobile').forEach(link => {
    link.addEventListener('click', () => {
        isMenuOpen = false;
        mobileNav.classList.remove('active');
        menuIcon.className = 'fas fa-bars';
    });
});

// Header Scroll Effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Smooth Scrolling Function
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        // Close mobile menu if open
        if (isMenuOpen) {
            isMenuOpen = false;
            mobileNav.classList.remove('active');
            menuIcon.className = 'fas fa-bars';
        }
    }
}

// Navigation Links Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        scrollToSection(targetId);
    });
});

// Portfolio Filter
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        filterBtns.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');
        
        const filter = btn.getAttribute('data-filter');
        
        portfolioItems.forEach(item => {
            if (filter === 'all' || item.getAttribute('data-category') === filter) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });
    });
});

// Contact Form Submission with Mailjet
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(contactForm);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        projectType: formData.get('projectType'),
        message: formData.get('message')
    };
    
    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    try {
        // Send email using Mailjet API
        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            // Success
            alert('Votre demande de devis a été envoyée avec succès ! Nous vous contacterons bientôt.');
            contactForm.reset();
        } else {
            throw new Error('Erreur lors de l\'envoi');
        }
    } catch (error) {
        console.error('Error:', error);
        
        // Fallback to email client
        const emailSubject = encodeURIComponent('Demande de Devis - DecoAndCo');
        const emailBody = encodeURIComponent(`
Nouvelle demande de devis:

Nom: ${data.name}
Email: ${data.email}
Téléphone: ${data.phone}
Type de projet: ${data.projectType}

Message:
${data.message}
        `);
        
        // Open email client
        window.location.href = `mailto:contact@decoandco.ma?subject=${emailSubject}&body=${emailBody}`;
        
        alert('Votre demande de devis va être envoyée à contact@decoandco.ma');
        contactForm.reset();
    } finally {
        // Remove loading state
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
});

// Intersection Observer for Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.service-card, .portfolio-item, .value-item, .about-stat').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set initial active filter
    const allFilter = document.querySelector('.filter-btn[data-filter="all"]');
    if (allFilter) {
        allFilter.classList.add('active');
    }
    
    // Add smooth scrolling to all internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
        });
    });
});