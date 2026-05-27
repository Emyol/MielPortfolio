"use client";
import React, { useState, useEffect } from 'react';
import './SpinningPreloader.css';

const TARGET_STRING = "Hi, I'm Amiel";
const CHAR_ARRAY = TARGET_STRING.split('');
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;':,./<>?";

export default function SpinningPreloader({ onComplete }) {
    const [isSpinning, setIsSpinning] = useState(false);
    const [lockedIndices, setLockedIndices] = useState(new Array(CHAR_ARRAY.length).fill(false));
    const [isExiting, setIsExiting] = useState(false);
    const [columns, setColumns] = useState([]);

    useEffect(() => {
        // Hydration safe: Generate random string paths strictly on the client
        setColumns(CHAR_ARRAY.map(char => generateColumn(char)));

        // Start the transition shortly after mount to allow CSS to register initial 0% state
        const startTimer = setTimeout(() => setIsSpinning(true), 50);

        let lockTimeouts = [];
        CHAR_ARRAY.forEach((char, index) => {
            if (char === ' ') {
                // Spaces don't spin, but we mark them locked for tracking
                setLockedIndices(prev => {
                    const next = [...prev];
                    next[index] = true;
                    return next;
                });
                return;
            }
            
            const durationMs = 300 + (index * 30);
            const timeout = setTimeout(() => {
                setLockedIndices(prev => {
                    const next = [...prev];
                    next[index] = true;
                    return next;
                });
            }, 50 + durationMs); // locks EXACTLY as the CSS transition finishes!
            
            lockTimeouts.push(timeout);
        });

        // The final character stops at:
        const totalDurationMs = 300 + ((CHAR_ARRAY.length - 1) * 30);

        let exitStartTimer;
        let finalUnmountTimer;

        const finishTimer = setTimeout(() => {
            exitStartTimer = setTimeout(() => {
                setIsExiting(true);
                finalUnmountTimer = setTimeout(onComplete, 400);
            }, 150);
        }, 50 + totalDurationMs);

        return () => {
            clearTimeout(startTimer);
            clearTimeout(finishTimer);
            clearTimeout(exitStartTimer);
            clearTimeout(finalUnmountTimer);
            lockTimeouts.forEach(clearTimeout);
        };
    }, [onComplete]);

    const generateColumn = (targetChar) => {
        if (targetChar === ' ') return [' '];
        const col = [];
        // Creates a heavy 30-character physical slot reel
        for (let i = 0; i < 30; i++) {
            col.push(ALPHABET[Math.floor(Math.random() * ALPHABET.length)]);
        }
        col.push(targetChar);
        return col;
    };

    return (
        <div className={`spinning-preloader ${isExiting ? 'exit' : ''}`}>
            <div className="meter-wrapper">
                {CHAR_ARRAY.map((char, idx) => {
                    const isSpace = char === ' ';
                    const columnChars = columns[idx];

                    if (!columnChars || columnChars.length === 0) return null;

                    const durationSec = 0.3 + (idx * 0.03);
                    const isLocked = lockedIndices[idx];

                    return (
                        <div key={idx} className={`char-column-container ${isSpace ? 'is-space' : ''}`}>
                            <div 
                                className="char-column"
                                style={{
                                    // Precisely compute ending transform based on column length
                                    transform: isSpinning ? `translateY(calc(-1.2em * ${columnChars.length - 1}))` : 'translateY(0%)',
                                    // Heavy friction mechanical curve
                                    transition: `transform ${durationSec}s cubic-bezier(0.1, 0.9, 0.2, 1)`,
                                    // Instantly snaps to 0px blur when isLocked fires at the end of the duration
                                    filter: (isSpinning && !isLocked) ? 'blur(4px)' : 'blur(0px)'
                                }}
                            >
                                {columnChars.map((c, i) => (
                                    <span key={i} className="char-slot">{c}</span>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
