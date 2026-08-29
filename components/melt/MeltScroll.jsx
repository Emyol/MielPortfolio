'use client';

import { useEffect, useRef, useState } from 'react';
import { site } from '../../data/site';
import { kit } from '../../data/kit';
import { JOBS } from './jobs';
import MeltCanvas from './MeltCanvas';
import styles from './MeltLab.module.css';

const TOOLS = kit.filter((row) => row.kind === 'tool');

export default function MeltScroll({ reduced = false }) {
  const scroller = useRef(null);
  const [progress, setProgress] = useState(0);
  const [pour, setPour] = useState(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      setPour(1);
      return undefined;
    }
    let frame;
    let start;
    const step = (now) => {
      if (start == null) start = now;
      const next = Math.min(1, (now - start) / 1800);
      setPour(next);
      if (next < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [reduced]);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return undefined;
    const skipPour = () => setPour(1);
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      const top = el.scrollTop;
      setProgress(max <= 0 ? 0 : top / max);
      if (top > 2) skipPour();
    };
    onScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    el.addEventListener('pointerdown', skipPour);
    el.addEventListener('wheel', skipPour, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      el.removeEventListener('pointerdown', skipPour);
      el.removeEventListener('wheel', skipPour);
    };
  }, []);

  return (
    <div ref={scroller} className={styles.scrollRoot}>
      <div className={styles.sticky}>
        <MeltCanvas reduced={reduced} mode="scroll" progress={progress} pour={pour} />
      </div>
      <div className={styles.track}>
        {JOBS.map((job) => (
          <section key={job.id} className={styles.chapter} data-job={job.id}>
            <p className={styles.kicker}>{job.label}</p>
            {job.id === 'identity' ? (
              <>
                <h2 className={styles.chapterTitle}>Amiel Acuña</h2>
                <img
                  className={styles.portrait}
                  src={site.portrait.src}
                  alt={site.portrait.alt}
                  width={72}
                  height={72}
                />
              </>
            ) : null}
            {job.id === 'kit' ? (
              <>
                <h2 className={styles.chapterTitle}>Kit</h2>
                <ul className={styles.markList}>
                  {TOOLS.map((row) => (
                    <li key={row.id}>{row.name}</li>
                  ))}
                </ul>
              </>
            ) : null}
            {job.id === 'work' ? (
              <>
                <h2 className={styles.chapterTitle}>Work</h2>
                <ul className={styles.workList}>
                  {site.projects.map((project) => (
                    <li key={project.id}>
                      <a href={project.href}>{project.name}</a>
                      <span className={styles.still}>Still pending</span>
                      <p>{project.desc}</p>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
            {job.id === 'proof' ? (
              <>
                <h2 className={styles.chapterTitle}>Proof</h2>
                <ul className={styles.markList}>
                  {site.certifications.map((row) => (
                    <li key={row.text}>
                      {row.year} · {row.text}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
            {job.id === 'contact' ? (
              <>
                <h2 className={styles.chapterTitle}>Contact</h2>
                <p className={styles.links}>
                  <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
                  <a href={site.contact.cvHref}>{site.contact.cvLabel}</a>
                  <a href={site.contact.github}>{site.contact.githubLabel}</a>
                  <a href={site.contact.linkedin}>{site.contact.linkedinLabel}</a>
                </p>
              </>
            ) : null}
          </section>
        ))}
      </div>
    </div>
  );
}
