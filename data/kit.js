export const kit = [
  { id: 'git', name: 'Git', kind: 'tool', mark: 'simple-icons:git' },
  { id: 'flutter', name: 'Flutter', kind: 'tool', mark: 'simple-icons:flutter' },
  { id: 'nextjs', name: 'Next.js', kind: 'tool', mark: 'simple-icons:nextdotjs' },
  { id: 'onnx', name: 'ONNX Runtime', kind: 'tool', mark: 'simple-icons:onnx' },
  { id: 'sap-activate', name: 'SAP Activate', kind: 'tool', mark: 'simple-icons:sap' },
  { id: 'claude-code', name: 'Claude Code', kind: 'tool', mark: 'simple-icons:anthropic' },
  { id: 'cursor', name: 'Cursor', kind: 'tool', mark: 'simple-icons:cursor' },
  { id: 'figma', name: 'Figma', kind: 'tool', mark: 'simple-icons:figma' },
  { id: 'google-workspace', name: 'Google Workspace', kind: 'tool', mark: 'simple-icons:google' },
  { id: 'pmi', name: 'PMI', kind: 'cert', mark: 'local:/kit/pmi.svg' },
  { id: 'sap', name: 'SAP', kind: 'cert', mark: 'simple-icons:sap' },
  { id: 'anthropic', name: 'Anthropic', kind: 'cert', mark: 'simple-icons:anthropic' },
  { id: 'google', name: 'Google', kind: 'cert', mark: 'simple-icons:google' },
  { id: 'mathworks', name: 'MathWorks', kind: 'cert', mark: 'simple-icons:mathworks' },
  { id: 'certiport', name: 'Certiport', kind: 'cert', mark: 'local:/kit/certiport.svg' },
];

export const kitById = Object.fromEntries(kit.map((row) => [row.id, row]));
