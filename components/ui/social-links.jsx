"use client";

import { useState } from 'react';

function SocialLink({ name, href, children }) {
  const [dismissed, setDismissed] = useState(false);

  return (
    <a
      className="social-icon-link"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${name} (opens in a new tab)`}
      data-tooltip-dismissed={dismissed}
      onPointerEnter={() => setDismissed(false)}
      onFocus={() => setDismissed(false)}
      onKeyDown={(event) => {
        if (event.key === 'Escape') setDismissed(true);
      }}
    >
      {children}
      <span className="social-icon-tooltip" aria-hidden="true">{name}</span>
    </a>
  );
}

export default function SocialLinks({ items }) {
 return <div className="contact-social-links">{items.filter(item=>!item.archived && item.href).map(item=><SocialLink key={item.id} name={item.name} href={item.href}><span aria-hidden="true">{item.name}</span></SocialLink>)}</div>;
}
