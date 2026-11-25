import { getImageProps } from 'next/image';
import { activeItems, getMetrics } from '@/lib/content/model';
import { DISCIPLINE_PROOF, WORK_EXTRAS, splitAwards } from '@/lib/dive/extras';
import DiveRoot from './DiveRoot';
import { SPRITE } from './sprite';

// The page is fully rendered here from content, so it reads without JavaScript.
// DiveRoot (client) then adds the ocean, the scroll scenes, the glass and the case pages.

const SECTION_ID = { projects: 'work', leadership: 'experience', credentials: 'recognition', about: 'about', contact: 'contact' };
const ordinal = (n) => n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th');
const ORDER = [['projects', 'Work'], ['leadership', 'Experience'], ['credentials', 'Recognition'], ['about', 'About'], ['contact', 'Contact']];
const FIT_HERO = "document.querySelectorAll('.hero .fit').forEach(function(f){var room=f.parentElement.clientWidth,line=f.firstElementChild;if(room<=0)return;f.style.fontSize='100px';var w=line.scrollWidth;if(w)f.style.fontSize=(100*room/w*0.995).toFixed(2)+'px';})";
// The images shipped in public/ go through Next's image optimizer, so each screen gets a resized WebP or AVIF;
// anything else (such as uploaded media) keeps its own URL. next.config.mjs allows exactly these paths and versions.
const OPTIMIZE = /^(?:\/(?:projects|certificates)\/[\w-]+\.(?:jpe?g|png|webp)(?:\?v=(?:[1-9]|1\d|2[0-2]))?|\/hero-profile\.png)$/;
const responsive = (src, sizes, width, height) => {
  if (!src || !OPTIMIZE.test(src)) return { src };
  const { props } = getImageProps({ src, alt: '', width, height, sizes });
  return { src: props.src, srcSet: props.srcSet, sizes: props.sizes };
};
// Rendered widths: screenshots about 90vw on phones and about half the window from 1024px; certificates at most 330px.
const SHOT_SIZES = '(min-width: 1024px) 54vw, 90vw';
const CERT_SIZES = '(max-width: 700px) 60vw, 330px';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const month = (ym) => (ym ? MONTHS[Number(ym.slice(5, 7)) - 1] + ' ' + ym.slice(0, 4) : '');
const fixHref = (href) => (href && href.startsWith('#') && SECTION_ID[href.slice(1)] ? '#' + SECTION_ID[href.slice(1)] : href);
const halves = (text) => { const w = text.trim().split(/\s+/), k = Math.ceil(w.length / 2); return [w.slice(0, k).join(' '), w.slice(k).join(' ')].filter(Boolean); };
const Arrow = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><use href="#i-arrow" /></svg>;
const Icon = ({ name }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><use href={'#i-' + name} /></svg>;

export function diveData(content) {
  const systems = activeItems(content.work.items).map((w) => {
    const x = WORK_EXTRAS[w.id] || {};
    return { id: w.id, title: w.title, kicker: w.meta, lede: w.description, img: w.imgSrc, repo: w.linkHref, demo: w.demoUrl, facts: x.facts || [], stack: x.stack || [], window: x.window || w.title, piece: x.pieceLabel ? w.id : '', pieceLabel: x.pieceLabel || '' };
  });
  const certs = activeItems(content.credentials.items).map((c) => ({ title: c.name, kicker: c.issuer + ' · ' + (c.year || 'no date on record'), img: c.image, cat: c.category, lede: c.detail, verify: c.verificationUrl }));
  const subtitle = content.hero.subtitle || '';
  const cut = subtitle.indexOf(' and ');
  const water = cut > 0 ? subtitle.slice(0, cut) : subtitle;
  return { systems, certs, water: halves(water), say: cut > 0 ? subtitle.slice(cut + 1) : '' };
}

export default function Dive({ content }) {
  const data = diveData(content);
  const shown = new Set(activeItems(content.navigation.items).map((n) => n.section));
  const nav = ORDER.filter(([key]) => shown.has(key));
  const name = content.profile.fullName.trim().split(/\s+/);
  const shortName = name.length > 1 ? name[0] + ' ' + name[name.length - 1] : name[0];
  const roles = [...activeItems(content.experience.items)].sort((a, b) => Number(b.current) - Number(a.current) || (b.endDate || '').localeCompare(a.endDate || '') || b.startDate.localeCompare(a.startDate));
  const { medals, also } = splitAwards(activeItems(content.awards.items));
  const disciplines = activeItems(content.practices.items).filter((p) => p.kind === 'Discipline');
  const stack = activeItems(content.stack.items);
  const proofStacks = Object.values(DISCIPLINE_PROOF).map((p) => p.stack).join(' ');
  const workStacks = data.systems.flatMap((s) => s.stack).join(' ');
  const alsoWrites = stack.filter((s) => s.category === 'Languages' && !proofStacks.includes(s.alt)).map((s) => s.alt);
  const shipsWith = stack.filter((s) => s.category === 'Delivery' || (s.category === 'Runtime' && !proofStacks.includes(s.alt) && !workStacks.includes(s.alt) && s.alt !== 'ONNX Runtime')).map((s) => s.alt);
  const bio = (content.hero.summary || '').replace(/^I[’']m [^.]+\.\s*/, '');
  const motto = (content.about.quote || '').split(/(?<=\.)\s+/).filter(Boolean);
  const say = data.say;
  const contactLines = halves(content.contact.headline || '');
  const socials = activeItems(content.contact.socials).filter((s) => /^https:\/\//.test(s.href));
  const cv = content.profile.cv;

  return (
    <DiveRoot data={data}>
      <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('dive-page','dive-js')" }} />
      <a href="#main" className="skip-link">Skip to content</a>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: SPRITE }} />
      <canvas id="ocean" aria-hidden="true" />
      <div className="edge" aria-hidden="true" />

      <header className="hd">
        <a className="brand" href="#top"><i>{(content.profile.shortName || name[0]).charAt(0)}</i>{shortName}</a>
        <nav className="glass" data-glass aria-label="Sections">
          {nav.map(([key, label]) => <a key={key} href={'#' + SECTION_ID[key]}>{label}</a>)}
          {cv && <a className="chip fill nav-cv" href={cv} target="_blank" rel="noopener noreferrer">{content.hero.cvLabel || 'Open CV'}</a>}
        </nav>
      </header>

      <nav className="gauge" aria-label="Depth">
        {nav.map(([key, label]) => <a key={key} href={'#' + SECTION_ID[key]} data-sec={SECTION_ID[key]}>{label}</a>)}
        <span className="gauge-now" aria-hidden="true"><span>0 m</span></span>
      </nav>

      <div className="page" id="top">
        <main id="main">
          <section className="hero" aria-label="Introduction">
            <div className="hero-water" id="hero-water" aria-hidden="true" />
            <div className="hero-card glass pane" data-glass>
              <h1>
                <span className="visually-hidden">{data.water.join(' ')} </span>
                <span className="say"><span className="fit" suppressHydrationWarning><span>{say || data.water.join(' ')}</span></span></span>
              </h1>
              {/* Fits the headline before the first paint (same sum as fitAll in engine.js), so the card does not jump when the engine starts. */}
              <script dangerouslySetInnerHTML={{ __html: FIT_HERO }} />
              <div className="hero-row">
                <div className="actions">
                  <a className="chip fill btn-lg" href={fixHref(content.hero.primaryHref) || '#work'}>{content.hero.primaryLabel}</a>
                  {shown.has('contact') && <a className="link" href="#contact">Get in touch</a>}
                </div>
                <p className="cue" aria-hidden="true"><i />Scroll to dive · click the water</p>
              </div>
            </div>
          </section>

          <ul className="figs glass pane" aria-label="Record" data-glass>
            {getMetrics(content).map((m, i) => (
              <li className="rv" style={{ '--i': i }} key={m.id}>
                <b><span data-count={m.value} data-pad={m.pad}>{String(m.value).padStart(m.pad || 0, '0')}</span>{m.suffix}</b>
                <span>{m.label}</span>
              </li>
            ))}
          </ul>

          {shown.has('projects') && data.systems.length > 0 && (
            <section className="work" id="work" aria-labelledby="work-h" style={{ '--n': data.systems.length }}>
              <div className="w-stage">
                <div className="w-top glass" data-glass>
                  <h2 className="display" id="work-h">Selected work</h2>
                  <div className="w-ticks label" aria-hidden="true">{data.systems.map((s) => <i key={s.id} />)}<span id="w-count">01 / {String(data.systems.length).padStart(2, '0')}</span></div>
                </div>
                <div className="w-items glass" id="w-items" data-glass>
                  {data.systems.map((s, i) => (
                    <div className={'w-item' + (i === 0 ? ' on' : '')} key={s.id}>
                      <p className="label">{s.kicker}</p>
                      <h3>{s.title}</h3>
                      <p>{s.lede}</p>
                      <div className="tags">{s.stack.slice(0, 4).map((t) => <span key={t}>{t}</span>)}</div>
                      <div className="actions">
                        <button className="chip fill" type="button" data-open-work={i}>Open the case<Arrow /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-screen" type="button" id="w-screen" aria-label="Open the case page">
                  <span className="win">
                    <span className="win-bar"><i aria-hidden="true"><b /></i><span id="w-wintitle">{data.systems[0].window}</span><em /></span>
                    <span className="w-shots" id="w-shots">
                      {data.systems.map((s) => <img key={s.id} {...responsive(s.img, SHOT_SIZES, 1600, 900)} alt={'Screenshot of ' + s.title} width="1100" height="619" draggable="false" loading="lazy" decoding="async" />)}
                      <canvas id="w-fx" aria-hidden="true" />
                    </span>
                  </span>
                </button>
              </div>
            </section>
          )}

          {shown.has('leadership') && (
            <section className="xp" id="experience" aria-labelledby="exp-h">
              <div className="xp-h glass pane" data-glass><h2 className="big split" id="exp-h">Experience</h2></div>
              <ol className="tl glass" id="tl" data-glass>
                <span className="tl-line" aria-hidden="true" />
                {roles.map((r, i) => (
                  <li className="rv" style={{ '--i': i % 3 }} key={r.id}>
                    <span className="when">{month(r.startDate)} – {r.current ? 'now' : month(r.endDate)}</span>
                    <div><b>{r.title}</b><span className="org">{r.org}</span></div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {shown.has('credentials') && (
            <section className="rec" id="recognition" aria-labelledby="rec-h">
              <div className="rec-medals">
                <div className="rec-head glass pane" data-glass><h2 className="big split" id="rec-h">Recognition</h2></div>
                <div className="awards" id="awards">
                  <ul className="medals">
                    {medals.map((m, i) => (
                      <li className="medal rv" style={{ '--i': i }} data-place={m.place} data-year={m.year} key={m.id}>
                        <canvas className="coin" aria-hidden="true" />
                        <span className="coin-alt" aria-hidden="true">{ordinal(m.place)}</span>
                        <span className="label">{m.label} · {m.year}</span>
                        <b>{m.short}</b>
                        {m.organization && <span className="org">{m.organization}</span>}
                      </li>
                    ))}
                  </ul>
                  {also.length > 0 && (
                    <div className="also glass" data-glass>
                      <span className="label">Also</span>
                      <ul>{also.map((a) => <li className="also-item" key={a.id}><span className="when">{a.year}</span><span>{a.title}</span></li>)}</ul>
                    </div>
                  )}
                </div>
              </div>
              <div className="rec-certs"><div className="rec-stage">
                <p className="label rec-certs-h">{content.credentials.galleryTitle || 'Certificates'}</p>
                <div className="strip" id="strip">
                  {data.certs.map((c, i) => (
                    <button className="cert glass" data-glass type="button" data-cert={i} key={i} aria-label={c.title + ', ' + c.kicker + '. Open.'}>
                      <span className="cert-img"><img {...responsive(c.img, CERT_SIZES, 1024, 790)} alt="" draggable="false" loading="lazy" decoding="async" /></span>
                      <span className="cert-meta"><span className="label">{c.kicker}</span><b>{c.title}</b></span>
                    </button>
                  ))}
                </div>
              </div></div>
            </section>
          )}

          {shown.has('about') && (
            <section className="about" id="about" aria-labelledby="about-h">
              <div className="about-l glass pane" data-glass>
                <h2 className="big split" id="about-h">About</h2>
                <figure className="who rv">
                  <span className="who-ph"><img {...responsive(content.profile.portrait || '/hero-profile.png', '145px', 960, 958)} alt={content.profile.portraitAlt} width="208" height="260" loading="lazy" decoding="async" /></span>
                  <figcaption><b>{shortName}</b><span>{content.profile.jobTitle}, {content.profile.school}</span><span className="when">Manila · <span id="clock">UTC+8</span></span></figcaption>
                </figure>
                {bio && <p className="bio rv">{bio}</p>}
                {motto.length > 0 && <blockquote className="motto rv">{motto.map((l, i) => <span key={i} className={i === motto.length - 1 && motto.length > 1 ? 'mute' : undefined}>{l}</span>)}</blockquote>}
              </div>
              <div className="about-r glass pane" data-glass>
                <p className="label idx-h rv">What I work on, and where it shows</p>
                <ol className="idx" id="idx">
                  {disciplines.map((p, i) => {
                    const proof = DISCIPLINE_PROOF[p.title] || {};
                    const w = proof.work ? data.systems.findIndex((s) => s.id === proof.work) : -1;
                    return (
                      <li className="rv" style={{ '--i': i }} key={p.id}>
                        <h3>{p.title}</h3>
                        <div className="proof">
                          {w >= 0
                            ? <button className="chip" type="button" data-open-work={w} aria-label={'Open ' + data.systems[w].title + ', the ' + p.title.toLowerCase() + ' project'}>{data.systems[w].title}<Arrow /></button>
                            : shown.has('leadership') ? <a className="label" href="#experience">See experience</a> : null}
                        </div>
                        <p>{p.body}</p>
                        {proof.stack && <p className="stack">{proof.stack}</p>}
                      </li>
                    );
                  })}
                </ol>
                <dl className="also rv">
                  {alsoWrites.length > 0 && <><dt>Also writes</dt><dd>{alsoWrites.join(', ')}</dd></>}
                  {shipsWith.length > 0 && <><dt>Ships with</dt><dd>{shipsWith.join(', ')}</dd></>}
                </dl>
              </div>
            </section>
          )}

          {shown.has('contact') && (
            <section className="contact" id="contact" aria-labelledby="contact-h">
              <div className="contact-card glass pane" data-glass>
                <h2 id="contact-h">{contactLines.map((l, i) => <span className="say" key={i}><span className="fit"><span>{l}</span></span></span>)}</h2>
                <div className="contact-row">
                  <p>{content.contact.description}</p>
                  <div className="actions">
                    {content.contact.email && <a className="chip fill btn-lg" href={'mailto:' + content.contact.email}>{content.contact.emailLabel || 'Email'}</a>}
                    {cv && <a className="chip" href={cv} target="_blank" rel="noopener noreferrer">{content.contact.cvLabel || 'Curriculum vitae'}</a>}
                    {socials.map((s) => <a className="chip" key={s.id} href={s.href} target="_blank" rel="noopener noreferrer">{s.name}</a>)}
                  </div>
                </div>
                <footer className="foot"><span>{content.contact.copyright}</span><span>{content.contact.location}</span><a href="#top">Back to the surface ↑</a></footer>
              </div>
            </section>
          )}
        </main>
      </div>

      <dialog className="view side-b" id="view" aria-labelledby="v-title">
        <div className="v-scroll" id="v-scroll">
          <div className="v-bar shell">
            <button className="chip" type="button" id="v-close"><Icon name="left" />Back</button>
            <div className="v-nav">
              <span className="label" id="v-count" />
              <button className="chip" type="button" id="v-prev" aria-label="Previous"><Icon name="left" /></button>
              <button className="chip" type="button" id="v-next" aria-label="Next"><Icon name="right" /></button>
            </div>
          </div>
          <div className="shell">
            <div className="v-body" id="v-body">
              <div className="v-head">
                <p className="label v-kicker" id="v-kicker" />
                <h2 className="display v-title" id="v-title" />
                <p className="v-lede" id="v-lede" />
              </div>
              <div className="v-grid">
                <div className="v-info" id="v-info" />
                <div className="v-piece" id="v-piece" />
              </div>
            </div>
          </div>
        </div>
      </dialog>
    </DiveRoot>
  );
}
