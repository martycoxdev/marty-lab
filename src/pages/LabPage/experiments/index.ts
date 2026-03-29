export type ExperimentId = 'wave-sphere' | 'wireframe' | 'torus-knot' | 'planet-approach';

export interface ExperimentMeta {
  id: ExperimentId;
  num: string;
  label: string;
  /** Whether OrbitControls should be rendered for this experiment */
  orbitControls: boolean;
}

export const EXPERIMENT_META: ExperimentMeta[] = [
  { id: 'wave-sphere', num: '01', label: 'Wave Sphere', orbitControls: true },
  { id: 'wireframe', num: '02', label: 'Wireframe', orbitControls: true },
  { id: 'torus-knot', num: '03', label: 'Torus Knot', orbitControls: true },
];
