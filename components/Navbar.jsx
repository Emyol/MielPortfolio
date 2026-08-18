"use client";

import { useEffect, useState } from 'react';

const LINKS = [
    { id: 'about', label: 'About' },
    { id: 'projects', label: 'Work' },
    { id: 'leadership', label: 'Leadership' },
    { id: 'contact', label: 'Contact' },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [active, setActive] = useState('');

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActive(entry.target.id);
                });
            },
            { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
        );
        LINKS.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, []);

    return (
        <nav className={`navbar fade-in dl-1 ${scrolled ? 'is-scrolled' : ''}`} aria-label="Primary">
            <a href="#main" className="nav-brand">MIEL.</a>
            <div className="nav-links">
                {LINKS.map(({ id, label }) => (
                    <a
                        key={id}
                        href={`#${id}`}
                        className={active === id ? 'is-active' : ''}
                        aria-current={active === id ? 'true' : undefined}
                    >
                        {label}
                    </a>
                ))}
            </div>
        </nav>
    );
}
