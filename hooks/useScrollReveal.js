"use client";
import { useEffect } from 'react';

export default function useScrollReveal(enabled = true) {
    useEffect(() => {
        if (!enabled) return;
        const revealElements = document.querySelectorAll('.scroll-reveal');
        
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -10% 0px',
            threshold: 0.1
        };

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        revealElements.forEach(el => {
            revealObserver.observe(el);
        });

        // Parallax effect on footer
        const footerHuge = document.querySelector('.footer-huge');
        const handleScroll = () => {
            if (footerHuge) {
                const scrolled = window.scrollY;
                const docHeight = document.body.offsetHeight;
                const winHeight = window.innerHeight;
                
                if (scrolled > docHeight - winHeight * 2) {
                    const shift = (scrolled - (docHeight - winHeight * 2)) * 0.1;
                    footerHuge.style.transform = `translateY(${shift}px)`;
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            revealObserver.disconnect();
            window.removeEventListener('scroll', handleScroll);
        };
    }, [enabled]);
}
