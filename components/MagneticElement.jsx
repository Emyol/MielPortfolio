"use client";
import { useEffect, useRef, useState } from 'react';

export default function MagneticElement({ children, className = '', as: Component = 'div', style = {}, ...props }) {
    const ref = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const finePointerRef = useRef(false);

    useEffect(() => {
        finePointerRef.current = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    }, []);

    const handleMouse = (e) => {
        if (!finePointerRef.current || !ref.current) return;

        const { clientX, clientY } = e;
        const { height, width, left, top } = ref.current.getBoundingClientRect();
        const middleX = clientX - (left + width / 2);
        const middleY = clientY - (top + height / 2);
        
        // 0.2 strength modifier for elegant magnetic pull
        setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
    };

    const reset = () => {
        setPosition({ x: 0, y: 0 });
    };

    return (
        <Component
            ref={ref}
            className={className}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                transition: position.x === 0 && position.y === 0 
                    ? 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)' // Slower snap-back
                    : 'transform 0.1s linear', // Fluid stick
                display: 'inline-block',
                ...style
            }}
            {...props}
        >
            {children}
        </Component>
    );
}
