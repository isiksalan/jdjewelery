document.addEventListener('DOMContentLoaded', function() {
    
    // Smooth scrolling for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Optional: Header Shrink on Scroll
    const header = document.querySelector('.glass-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.padding = '0.5rem 2rem';
        } else {
            header.style.padding = '1rem 2rem';
        }
    });
});

/* --- LIGHTBOX FUNCTIONALITY --- */
    
    // Get the DOM elements
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.close-lightbox');
    
    // Select all images in the gallery
    const galleryImages = document.querySelectorAll('.gallery-image');

    // Add click event to EVERY gallery image
    galleryImages.forEach(image => {
        image.addEventListener('click', function() {
            lightbox.style.display = 'flex';       // Show the modal
            lightbox.style.alignItems = 'center';  // Center vertically
            lightbox.style.justifyContent = 'center'; // Center horizontally
            lightboxImg.src = this.src;            // Set modal image to clicked image
        });
    });

    // Close when clicking the 'X'
    closeBtn.addEventListener('click', function() {
        lightbox.style.display = 'none';
    });

    // Close when clicking outside the image (on the dark background)
    lightbox.addEventListener('click', function(e) {
        if (e.target !== lightboxImg) {
            lightbox.style.display = 'none';
        }
    });