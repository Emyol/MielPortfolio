export const JOBS = [
  { id: 'identity', label: 'Name' },
  { id: 'kit', label: 'Kit' },
  { id: 'work', label: 'Work' },
  { id: 'proof', label: 'Proof' },
  { id: 'contact', label: 'Contact' },
];

function clamp01(v) {
  return Math.min(1, Math.max(0, v));
}

function smooth(a, b, t) {
  const x = clamp01((b === a ? 1 : (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
}

export function jobWeights(progress) {
  const p = clamp01(progress);
  return {
    identity: 1 - smooth(0.12, 0.26, p),
    kit: smooth(0.14, 0.28, p) * (1 - smooth(0.36, 0.48, p)),
    work: smooth(0.36, 0.5, p) * (1 - smooth(0.58, 0.7, p)),
    proof: smooth(0.58, 0.7, p) * (1 - smooth(0.78, 0.88, p)),
    contact: smooth(0.78, 0.9, p),
  };
}
