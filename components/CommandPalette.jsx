"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Compass,
  Award,
  FileText,
  FolderGit2,
  Mail,
  Network,
  Search,
  SquareStack,
  Users,
} from 'lucide-react';

const GROUPS = [
  {
    heading: 'On this page',
    items: [
      { label: 'Discipline', hint: 'About', href: '#about', Icon: Compass },
      { label: 'Certificates & awards', hint: 'Credentials', href: '#credentials', Icon: Award },
      { label: 'Selected systems', hint: 'Work', href: '#projects', Icon: SquareStack },
      { label: 'Leadership', hint: 'Record', href: '#leadership', Icon: Users },
      { label: 'Contact', hint: 'Write', href: '#contact', Icon: Mail },
    ],
  },
  {
    heading: 'Elsewhere',
    items: [
      { label: 'Curriculum vitae', hint: 'PDF', href: '/Amiel_Acuna_CV.pdf', external: true, Icon: FileText },
      { label: 'GitHub', hint: 'Code', href: 'https://github.com/Emyol', external: true, Icon: FolderGit2 },
      { label: 'LinkedIn', hint: 'Network', href: 'https://www.linkedin.com/in/amiel-josiah-acu%C3%B1a-4786a515a', external: true, Icon: Network },
    ],
  },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const backdropRef = useRef(null);
  const triggerRef = useRef(null);
  const groups = useMemo(
    () => GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())),
    })).filter((group) => group.items.length > 0),
    [query],
  );
  const flat = groups.flatMap((group) => group.items);

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const background = [...document.body.children].filter((node) => node !== backdropRef.current && !node.classList.contains('command-backdrop'));
    const previousInert = background.map((node) => node.inert);
    background.forEach((node) => { node.inert = true; });
    const containFocus = (event) => {
      if (!backdropRef.current?.contains(event.target)) inputRef.current?.focus();
    };
    document.addEventListener('focusin', containFocus);
    setActive(0);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('focusin', containFocus);
      background.forEach((node, index) => { node.inert = previousInert[index]; });
      triggerRef.current?.focus({ preventScroll: true });
      setQuery('');
      setActive(0);
    };
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    if (open) document.getElementById(`destination-${active}`)?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  }, [active, open]);

  const execute = (command) => {
    if (!command) return;
    setOpen(false);
    if (command.external) window.open(command.href, '_blank', 'noopener,noreferrer');
    else {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      document.querySelector(command.href)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    }
  };

  const onDialogKey = (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      inputRef.current?.focus();
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((index) => (flat.length === 0 ? 0 : (index + 1) % flat.length));
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((index) => (flat.length === 0 ? 0 : (index - 1 + flat.length) % flat.length));
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      execute(flat[active]);
    }
  };

  return (
    <>
      <button ref={triggerRef} type="button" className="command-trigger" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open}>
        <Search aria-hidden="true" />
        <span>Find</span>
        <kbd>Ctrl K</kbd>
      </button>

      {typeof document !== 'undefined' && createPortal(<>
      {open && (
        <div
          ref={backdropRef}
          className="command-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              // Prevent the backdrop's default mousedown from stealing restored focus.
              event.preventDefault();
              setOpen(false);
            }
          }}
        >
          <div
            className="command-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Find on this page"
            onKeyDown={onDialogKey}
          >
            <label className="command-search">
              <Search aria-hidden="true" />
              <span className="visually-hidden">Search</span>
              <input
                ref={inputRef}
                autoFocus
                role="combobox"
                aria-expanded="true"
                aria-autocomplete="list"
                aria-controls="find-destinations"
                aria-activedescendant={flat.length ? `destination-${active}` : undefined}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search the Field"
              />
              <kbd>Esc</kbd>
            </label>
            <div id="find-destinations" className="command-results" role="listbox" aria-label="Destinations">
              {groups.map((group) => (
                <div key={group.heading} className="command-group" role="group" aria-label={group.heading}>
                  <p className="command-heading">{group.heading}</p>
                  {group.items.map((command) => {
                    const index = flat.indexOf(command);
                    const Icon = command.Icon;
                    return (
                      <button
                        key={command.label}
                        type="button"
                        id={`destination-${index}`}
                        tabIndex={-1}
                        onMouseDown={(event) => event.preventDefault()}
                        role="option"
                        aria-selected={index === active}
                        className={index === active ? 'is-active' : ''}
                        onMouseEnter={() => setActive(index)}
                        onClick={() => execute(command)}
                      >
                        <span className="command-label">
                          <Icon aria-hidden="true" />
                          {command.label}
                        </span>
                        <small>{command.hint}</small>
                      </button>
                    );
                  })}
                </div>
              ))}
              {flat.length === 0 && <p>Nothing matches.</p>}
            </div>
          </div>
        </div>
      )}
      </>, document.body)}
    </>
  );
}
