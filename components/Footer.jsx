"use client";

import { ArrowUpRight } from 'lucide-react';
import PinTitle from './PinTitle';
import { Button } from '@/components/ui/button';
import SocialLinks from '@/components/ui/social-links';

export default function Footer({ content }) {
  return (
    <footer id="contact" className="field-section" aria-labelledby="contact-title" data-pin-section>
      <div className="field-shell field-split">
        <PinTitle id="contact-title">{content.contact.title}</PinTitle>
        <div className="field-contact">
          <div className="contact-editorial">
            <div className="contact-intro">
              <h3>{content.contact.headline}</h3>
              <p>{content.contact.description}</p>
            </div>
            <div className="contact-details">
              <p>{content.contact.location}</p>
              <a href={`mailto:${content.contact.email}`}>{content.contact.email}</a>
              <a href={`tel:${content.contact.phone.replace(/[^+0-9]/g, "")}`}>{content.contact.phone}</a>
            </div>
            <div className="contact-actions">
              <Button asChild>
                <a href={`mailto:${content.contact.email}`}>{content.contact.emailLabel} <ArrowUpRight /></a>
              </Button>
              <a href={content.profile.cv} target="_blank" rel="noopener noreferrer">
                {content.contact.cvLabel} <ArrowUpRight aria-hidden="true" />
              </a>
              <SocialLinks items={content.contact.socials} />
            </div>
          </div>
          <div className="field-colophon">
            <p>{content.contact.copyright}</p>
            <a href="#hero">{content.contact.backLabel}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
