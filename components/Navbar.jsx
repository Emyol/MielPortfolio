"use client";

import { useEffect, useState } from 'react';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <nav className={`navbar fade-in dl-1 ${scrolled ? 'is-scrolled' : ''}`} aria-label="Primary">
            <a href="#main" className="nav-brand">MIEL.</a>
            <div className="nav-links">
                <a href="#about">About</a>
                <a href="#projects">Work</a>
                <a href="#leadership">Leadership</a>
                <a href="#contact">Contact</a>
            </div>
        </nav>
    );
}
