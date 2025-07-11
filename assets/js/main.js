$(document).ready(function() {
    // Demo functionality
    let demoRunning = false;
    let demoInterval;
    
    // Demo toggle functionality
    $('#demoToggle').click(function() {
        if (!demoRunning) {
            startDemo();
        } else {
            stopDemo();
        }
    });
    
    function startDemo() {
        demoRunning = true;
        $('#demoToggle').html('<i class="bi bi-pause-fill me-2"></i>Arrêter la démo').removeClass('btn-success').addClass('btn-danger');
        
        demoInterval = setInterval(function() {
            updateDemoValues();
        }, 2000);
    }
    
    function stopDemo() {
        demoRunning = false;
        $('#demoToggle').html('<i class="bi bi-play-fill me-2"></i>Lancer la démo').removeClass('btn-danger').addClass('btn-success');
        
        if (demoInterval) {
            clearInterval(demoInterval);
        }
    }
    
    function updateDemoValues() {
        // TRS
        const trs = Math.max(75, Math.min(98, 87.2 + (Math.random() - 0.5) * 4));
        $('#trsValue').text(trs.toFixed(1) + '%');
        $('#trsProgress').css('width', trs + '%');
        
        // Availability
        const availability = Math.max(85, Math.min(99, 94.5 + (Math.random() - 0.5) * 2));
        $('#availabilityValue').text(availability.toFixed(1) + '%');
        $('#availabilityProgress').css('width', availability + '%');
        
        // MTTR
        const mttr = Math.max(8, Math.min(25, 12.3 + (Math.random() - 0.5) * 6));
        $('#mttrValue').text(mttr.toFixed(1) + 'h');
        $('#mttrProgress').css('width', ((25 - mttr) * 4) + '%');
        
        // Energy
        const energy = Math.max(120, Math.min(200, 156 + (Math.random() - 0.5) * 20));
        $('#energyValue').text(Math.round(energy) + ' kW');
        $('#energyProgress').css('width', (energy / 200 * 100) + '%');
    }
    
    // Smooth scrolling for navigation links
    $('a[href^="#"]').click(function(e) {
        e.preventDefault();
        const target = $(this.getAttribute('href'));
        if (target.length) {
            $('html, body').animate({
                scrollTop: target.offset().top - 80
            }, 800);
        }
    });
    
    // Form submissions with real API calls
    $('#quoteForm').submit(function(e) {
        e.preventDefault();
        submitQuoteForm();
    });
    
    $('#contactForm').submit(function(e) {
        e.preventDefault();
        submitContactForm();
    });
    
    function submitQuoteForm() {
        const form = $('#quoteForm');
        const submitBtn = form.find('button[type="submit"]');
        const originalText = submitBtn.text();
        
        // Show loading state
        submitBtn.html('<span class="spinner me-2"></span>Envoi en cours...').prop('disabled', true);
        
        // Collect form data
        const formData = {
            firstName: form.find('input[name="firstName"]').val(),
            lastName: form.find('input[name="lastName"]').val(),
            email: form.find('input[name="email"]').val(),
            phone: form.find('input[name="phone"]').val(),
            company: form.find('input[name="company"]').val(),
            industry: form.find('select[name="industry"]').val(),
            projectType: form.find('select[name="projectType"]').val(),
            description: form.find('textarea[name="description"]').val(),
            gdprConsent: form.find('input[name="gdprConsent"]').is(':checked'),
            submittedAt: new Date().toISOString(),
            source: 'Website Quote Request'
        };
        
        // Send to API - Use relative URL
        fetch('/contact-handler.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.message) {
                // Show success message
                showToast('✅ Votre demande de devis a été envoyée avec succès ! Nous vous contacterons sous 24h.', 'success');
                
                // Reset form and close modal
                form[0].reset();
                $('#quoteModal').modal('hide');
            } else {
                throw new Error('Erreur lors de l\'envoi');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('❌ Erreur lors de l\'envoi. Veuillez réessayer.', 'error');
        })
        .finally(() => {
            // Reset button
            submitBtn.text(originalText).prop('disabled', false);
        });
    }
    
    function submitContactForm() {
        const form = $('#contactForm');
        const submitBtn = form.find('button[type="submit"]');
        const originalText = submitBtn.text();
        
        // Show loading state
        submitBtn.html('<span class="spinner me-2"></span>Envoi en cours...').prop('disabled', true);
        
        // Collect form data
        const formData = {
            name: form.find('input[name="name"]').val(),
            email: form.find('input[name="email"]').val(),
            company: form.find('input[name="company"]').val(),
            subject: form.find('select[name="subject"]').val(),
            message: form.find('textarea[name="message"]').val(),
            gdprConsent: form.find('input[name="gdprConsent"]').is(':checked'),
            submittedAt: new Date().toISOString(),
            source: 'Website Contact Form'
        };
        
        // Send to API - Use relative URL
        fetch('/contact-handler.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.message) {
                // Show success message
                showToast('✅ Votre message a été envoyé avec succès ! Nous vous contacterons sous 24h.', 'success');
                
                // Reset form and close modal
                form[0].reset();
                $('#contactModal').modal('hide');
            } else {
                throw new Error('Erreur lors de l\'envoi');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('❌ Erreur lors de l\'envoi. Veuillez réessayer.', 'error');
        })
        .finally(() => {
            // Reset button
            submitBtn.text(originalText).prop('disabled', false);
        });
    }
    
    function showToast(message, type = 'info') {
        const toastId = 'toast-' + Date.now();
        const toastClass = type === 'success' ? 'bg-success' : type === 'error' ? 'bg-danger' : 'bg-primary';
        
        const toast = $(`
            <div id="${toastId}" class="toast align-items-center text-white ${toastClass} border-0" role="alert">
                <div class="d-flex">
                    <div class="toast-body">
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        `);
        
        // Create toast container if it doesn't exist
        if ($('#toast-container').length === 0) {
            $('body').append('<div id="toast-container" class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 9999;"></div>');
        }
        
        $('#toast-container').append(toast);
        
        // Show toast
        const bsToast = new bootstrap.Toast(toast[0]);
        bsToast.show();
        
        // Remove toast after it's hidden
        toast.on('hidden.bs.toast', function() {
            $(this).remove();
        });
    }
    
    // Test email functionality (for development)
    window.testEmail = function() {
        fetch('/contact-handler.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            showToast('📧 Test email sent! Check your inbox.', 'success');
            console.log('Test email result:', data);
        })
        .catch(error => {
            showToast('❌ Test email failed.', 'error');
            console.error('Test email error:', error);
        });
    };
    
    // Navbar scroll effect
    $(window).scroll(function() {
        if ($(window).scrollTop() > 50) {
            $('.navbar').addClass('shadow-sm');
        } else {
            $('.navbar').removeClass('shadow-sm');
        }
    });
    
    // Add animation classes when elements come into view
    function animateOnScroll() {
        $('.card, .feature-card').each(function() {
            const elementTop = $(this).offset().top;
            const elementBottom = elementTop + $(this).outerHeight();
            const viewportTop = $(window).scrollTop();
            const viewportBottom = viewportTop + $(window).height();
            
            if (elementBottom > viewportTop && elementTop < viewportBottom) {
                $(this).addClass('fade-in-up');
            }
        });
    }
    
    // Run animation check on scroll
    $(window).scroll(animateOnScroll);
    
    // Run animation check on page load
    animateOnScroll();
    
    // Initialize tooltips
    $('[data-bs-toggle="tooltip"]').tooltip();
    
    // Initialize popovers
    $('[data-bs-toggle="popover"]').popover();
    
    // Auto-start demo after 3 seconds
    setTimeout(function() {
        if (!demoRunning) {
            startDemo();
        }
    }, 3000);
});

// Additional utility functions
function formatNumber(num) {
    return new Intl.NumberFormat('fr-FR').format(num);
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return re.test(phone);
}

// Export functions for global use
window.IOMetric = {
    formatNumber,
    validateEmail,
    validatePhone,
    testEmail: window.testEmail
};