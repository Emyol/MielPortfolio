"use client";

import { ArrowUpRight } from 'lucide-react';
import PinTitle from './PinTitle';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Footer() {
  return (
    <footer id="contact" className="field-section" aria-labelledby="contact-title" data-pin-section>
      <div className="field-shell field-split">
        <PinTitle id="contact-title">Contact</PinTitle>
        <div className="field-contact">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-4xl tracking-tight leading-none">
                Have a system worth building?
              </CardTitle>
              <CardDescription>
                Send the context, constraint, or opportunity. I will respond with a clear next step.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <p className="contact-row">Manila, Philippines · Available globally</p>
              <p className="contact-row">
                <a href="mailto:acunaamieljosiah@gmail.com">acunaamieljosiah@gmail.com</a>
              </p>
              <p className="contact-row">
                <a href="tel:+639610459227">+63 961 045 9227</a>
              </p>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2 pb-6">
              <Button asChild>
                <a href="mailto:acunaamieljosiah@gmail.com">Email Amiel</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/Amiel_Acuna_CV.pdf" target="_blank" rel="noopener noreferrer">
                  Curriculum vitae <ArrowUpRight />
                </a>
              </Button>
              <Button asChild variant="ghost">
                <a href="https://github.com/Emyol" target="_blank" rel="noopener noreferrer">
                  GitHub <ArrowUpRight />
                </a>
              </Button>
              <Button asChild variant="ghost">
                <a href="https://www.linkedin.com/in/amiel-josiah-acu%C3%B1a-4786a515a" target="_blank" rel="noopener noreferrer">
                  LinkedIn <ArrowUpRight />
                </a>
              </Button>
            </CardFooter>
          </Card>
          <div className="field-colophon">
            <p>© 2026 Amiel Acuña</p>
            <a href="#hero">Back to the Field</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
