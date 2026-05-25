// Minimalist, high-performance scroll observer
document.addEventListener("DOMContentLoaded", () => {
    // 1. Intersection Observer for Scroll Reveals
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    // The observer options
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -10% 0px', // Triggers slightly before the element enters the viewport
        threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                // Optional: Unobserve after revealing to only trigger once
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // 2. Parallax effect on hero image or soft elements (optional extra polish)
    // Here applied subtly to the massive footer text
    const footerHuge = document.querySelector('.footer-huge');
    if (footerHuge) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            const docHeight = document.body.offsetHeight;
            const winHeight = window.innerHeight;
            
            // Only apply effect when nearing the bottom of the page
            if (scrolled > docHeight - winHeight * 2) {
                const shift = (scrolled - (docHeight - winHeight * 2)) * 0.1;
                footerHuge.style.transform = `translateY(${shift}px)`;
            }
        }, { passive: true });
    }

    // --- CUSTOM TYPOGRAPHY PRELOADER ---
    const counterElement = document.getElementById("counter");
    const preloader = document.querySelector(".preloader");
    
    if (counterElement && preloader) {
        let currentValue = 0;
        
        // Random interval simulation to make it feel visceral
        const updateCounter = () => {
            if (currentValue === 100) return;

            // Harsh randomized jumps
            currentValue += Math.floor(Math.random() * 10) + 2;
            
            if (currentValue > 100) {
                currentValue = 100;
            }

            counterElement.textContent = currentValue;

            // Random delay between jumps for industrial realism
            let delay = Math.floor(Math.random() * 80) + 20;

            if (currentValue === 100) {
                // Handoff logic: Allow a split second of 100% reading
                setTimeout(() => {
                    preloader.classList.add("completed");
                    
                    // Re-activate hero staggering the exact millisecond the slide finishes (800ms transition)
                    setTimeout(() => {
                        document.body.classList.remove("loading");
                    }, 800);
                }, 400);
            } else {
                setTimeout(updateCounter, delay);
            }
        };

        // Start counter
        setTimeout(updateCounter, 100);
    }
});
