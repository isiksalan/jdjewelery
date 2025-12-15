document.addEventListener('DOMContentLoaded', function() {
    
    /* --- 1. NAVIGATION & UI --- */
    
    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Header Shrink
    const header = document.querySelector('.glass-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.padding = '0.5rem 2rem';
        } else {
            header.style.padding = '1rem 2rem';
        }
    });

    /* --- 2. LIGHTBOX FUNCTIONALITY --- */
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.close-lightbox');

    // Event Delegation for dynamically loaded images
    document.body.addEventListener('click', function(e) {
        if (e.target.classList.contains('gallery-image')) {
            lightbox.style.display = 'flex';
            lightbox.style.alignItems = 'center';
            lightbox.style.justifyContent = 'center';
            lightboxImg.src = e.target.src;
        }
    });

    closeBtn.addEventListener('click', function() {
        lightbox.style.display = 'none';
    });

    lightbox.addEventListener('click', function(e) {
        if (e.target !== lightboxImg) {
            lightbox.style.display = 'none';
        }
    });

    /* --- 3. LOAD COLLECTIONS FROM FIREBASE --- */
    loadCollectionsFromFirebase();

});

// --- LOAD COLLECTIONS FROM FIREBASE FIRESTORE ---
async function loadCollectionsFromFirebase() {
    const container = document.getElementById('slider-container');
    
    try {
        // Show loading state
        container.innerHTML = "<p style='text-align:center; color: var(--gold-primary);'>Loading collections...</p>";
        
        // Fetch collections from Firestore
        const snapshot = await db.collection('collections')
            .orderBy('order', 'desc')
            .get();
        
        if (snapshot.empty) {
            container.innerHTML = `
                <div style="text-align:center; padding: 3rem;">
                    <p style="color: var(--text-grey); font-style: italic;">No collections available yet.</p>
                    <p style="color: var(--text-grey); font-size: 0.9rem; margin-top: 1rem;">Check back soon for our latest jewelry collections!</p>
                </div>
            `;
            // Hide navigation buttons if no collections
            const prevBtn = document.getElementById('prevBtn');
            const nextBtn = document.getElementById('nextBtn');
            if(prevBtn) prevBtn.style.display = 'none';
            if(nextBtn) nextBtn.style.display = 'none';
            return;
        }

        let htmlContent = '';
        let slideIndex = 0;
        
        // Build HTML for each collection
        snapshot.forEach(doc => {
            const collection = doc.data();
            const activeClass = slideIndex === 0 ? 'active' : '';
            
            // Build items grid
            let itemsHtml = '';
            if(collection.items && collection.items.length > 0) {
                collection.items.forEach(item => {
                    itemsHtml += `
                        <div class="gallery-item">
                            <img src="${item.image}" alt="${item.name}" class="gallery-item-img gallery-image">
                            <div class="item-details">
                                <h3>${item.name}</h3>
                                <p>Handcrafted</p>
                            </div>
                        </div>
                    `;
                });
            } else {
                itemsHtml = '<p style="text-align:center; color: var(--text-grey);">No items in this collection yet.</p>';
            }

            // Add the slide
            htmlContent += `
                <div class="collection-slide ${activeClass}">
                    <h2 class="section-title">${collection.name}</h2>
                    <div class="separator-floral"></div>
                    <div class="gallery-grid">
                        ${itemsHtml}
                    </div>
                </div>
            `;
            
            slideIndex++;
        });

        container.innerHTML = htmlContent;
        
        // Initialize slider navigation
        initSliderLogic();
        
    } catch (error) {
        console.error("Error loading collections:", error);
        
        // Fallback content if Firebase fails
        container.innerHTML = `
            <div style="text-align:center; padding: 2rem;">
                <p style="color: var(--text-grey);">Unable to load collections at the moment.</p>
                <p style="color: var(--text-grey); font-size: 0.9rem; margin-top: 1rem;">Please try refreshing the page.</p>
            </div>
        `;
    }
}

// Function to make the Next/Prev buttons work
function initSliderLogic() {
    let currentSlideIndex = 0;
    const slides = document.querySelectorAll('.collection-slide');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    // Hide arrows if there is only 1 collection
    if (slides.length <= 1) {
        if(prevBtn) prevBtn.style.display = 'none';
        if(nextBtn) nextBtn.style.display = 'none';
        return;
    }

    // Show arrows if multiple collections
    if(prevBtn) prevBtn.style.display = 'block';
    if(nextBtn) nextBtn.style.display = 'block';

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));

        if (index >= slides.length) currentSlideIndex = 0;
        else if (index < 0) currentSlideIndex = slides.length - 1;
        else currentSlideIndex = index;

        slides[currentSlideIndex].classList.add('active');
    }

    if(nextBtn) {
        nextBtn.onclick = () => showSlide(currentSlideIndex + 1);
    }
    if(prevBtn) {
        prevBtn.onclick = () => showSlide(currentSlideIndex - 1);
    }
}