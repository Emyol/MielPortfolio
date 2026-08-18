"use client";

import { useEffect, useState } from 'react';

const SECTIONS = [
    { id: 'hero', label: 'Index' },
    { id: 'about', label: 'Discipline' },
    { id: 'projects', label: 'Work' },
    { id: 'leadership', label: 'Leadership' },
    { id: 'contact', label: 'Contact' },
];

export default function SectionIndicator() {
    const [active, setActive] = useState('hero');

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActive(entry.target.id);
                });
            },
            // Active = whichever section is crossing the vertical center
            { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
        );

        SECTIONS.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <nav className="section-indicator" aria-label="Section progress">
            {SECTIONS.map(({ id, label }, i) => (
                <a
                    key={id}
                    href={`#${id}`}
                    className={id === active ? 'is-active' : ''}
                    aria-current={id === active ? 'true' : undefined}
                >
                    <span className="si-label">{label}</span>
                    <span>{String(i + 1).padStart(2, '0')}</span>
                    <span className="si-tick" aria-hidden="true" />
                </a>
            ))}
        </nav>
    );
}
