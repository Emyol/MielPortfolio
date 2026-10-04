"use client";

import { ArrowUpRight } from 'lucide-react';
import PinTitle from './PinTitle';
import { Button } from '@/components/ui/button';
import SocialLinks from '@/components/ui/social-links';

export default function Footer() {
  return (
    <footer id="contact" className="field-section" aria-labelledby="contact-title" data-pin-section>
      <div className="field-shell field-split">
        <PinTitle id="contact-title">Contact</PinTitle>
        <div className="field-contact">
          <div className="contact-editorial">
            <div className="contact-intro">
              <h3>Have a system worth building?</h3>
              <p>Send the context, constraint, or opportunity. I will respond with a clear next step.</p>
            </div>
            <div className="contact-details">
              <p>Manila, Philippines · Available globally</p>
              <a href="mailto:acunaamieljosiah@gmail.com">acunaamieljosiah@gmail.com</a>
              <a href="tel:+639610459227">+63 961 045 9227</a>
            </div>
            <div className="contact-actions">
              <Button asChild>
                <a href="mailto:acunaamieljosiah@gmail.com">Email Amiel <ArrowUpRight /></a>
              </Button>
              <a href="/Amiel_Acuna_CV.pdf" target="_blank" rel="noopener noreferrer">
                Curriculum vitae <ArrowUpRight aria-hidden="true" />
              </a>
              <SocialLinks />
            </div>
          </div>
          <div className="field-colophon">
            <p>© 2026 Amiel Acuña</p>
            <a href="#hero">Back to the Field</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
