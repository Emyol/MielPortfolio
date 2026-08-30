import Image from 'next/image';
import { STACK_GROUPS } from '../data/stack';

export default function TechStack() {
    return (
        <div className="tech-stack scroll-reveal">
            {STACK_GROUPS.map((group) => (
                <div key={group.label} className="stack-group">
                    <span className="stack-label">
                        <span className="stack-label-dot" aria-hidden="true" />
                        {group.label}
                    </span>
                    <ul className="tech-logo-grid">
                        {group.items.map((item) => (
                            <li key={item.slug}>
                                <div className="tech-logo-tile" title={item.label}>
                                    <Image
                                        src={`/logos/${item.slug}.svg`}
                                        alt={item.label}
                                        width={28}
                                        height={28}
                                        className="tech-logo-img"
                                    />
                                    <span className="tech-logo-label">{item.label}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}
