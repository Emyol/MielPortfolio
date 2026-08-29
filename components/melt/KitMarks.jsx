import styles from './MeltLab.module.css';

const ICONS = {
  git: (
    <g fill="currentColor">
      <circle cx="32" cy="28" r="10" />
      <circle cx="80" cy="28" r="10" />
      <circle cx="56" cy="84" r="10" />
      <path d="M32 28h48M56 28v56" stroke="currentColor" strokeWidth="10" />
    </g>
  ),
  flutter: (
    <g fill="currentColor">
      <path d="M22 52 L58 16 H90 L54 52z" />
      <path d="M54 60 L70 44 H90 L58 76z" />
      <path d="M42 72 L58 88 L26 88z" />
    </g>
  ),
  nextjs: (
    <g fill="none" stroke="currentColor" strokeWidth="10">
      <circle cx="56" cy="56" r="30" />
      <path d="M44 76 L72 36" />
    </g>
  ),
  onnx: (
    <g fill="none" stroke="currentColor" strokeWidth="10">
      <circle cx="56" cy="56" r="28" />
      <path d="M56 28v56M28 56h56" />
    </g>
  ),
  'sap-activate': (
    <g fill="none" stroke="currentColor" strokeWidth="10">
      <rect x="26" y="26" width="60" height="60" rx="10" />
      <path d="M38 56h36" />
    </g>
  ),
  'claude-code': (
    <g fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round">
      <path d="M30 64a26 26 0 1 1 52 0" />
      <path d="M40 72h32" />
    </g>
  ),
  cursor: (
    <g fill="currentColor">
      <path d="M34 20 L34 92 L52 72 L70 102 L86 94 L64 66 L92 66z" />
    </g>
  ),
  figma: (
    <g fill="currentColor">
      <circle cx="56" cy="30" r="14" />
      <circle cx="38" cy="52" r="14" />
      <circle cx="74" cy="52" r="14" />
      <circle cx="38" cy="82" r="14" />
      <circle cx="56" cy="82" r="14" />
    </g>
  ),
  'google-workspace': (
    <g fill="none" stroke="currentColor" strokeWidth="10" strokeLinejoin="round">
      <path d="M56 22 L90 40 L90 72 L56 90 L22 72 L22 40z" />
    </g>
  ),
};

export default function KitMarks({ tools }) {
  return (
    <ul className={styles.kitMarks}>
      {tools.map((row) => (
        <li key={row.id}>
          <span className={styles.kitCoin} aria-hidden="true">
            <svg viewBox="0 0 112 112" width="32" height="32" focusable="false">
              {ICONS[row.id] || ICONS.git}
            </svg>
          </span>
          <span>{row.name}</span>
        </li>
      ))}
    </ul>
  );
}
