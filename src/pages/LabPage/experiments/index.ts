export type ExperimentId = 'wave-sphere' | 'wireframe' | 'torus-knot' | 'planet-approach' | 'street';

export interface ExperimentMeta {
  id: ExperimentId;
  num: string;
  label: string;
  /** Whether OrbitControls should be rendered for this experiment */
  orbitControls: boolean;
  /** Scroll space height in vh (e.g. 300 = three viewport heights) */
  scrollVh: number;
}

export const EXPERIMENT_META: ExperimentMeta[] = [
  { id: 'wave-sphere', num: '01', label: 'Wave Sphere', orbitControls: true,  scrollVh: 300  },
  { id: 'wireframe',   num: '02', label: 'Wireframe',   orbitControls: true,  scrollVh: 300  },
  { id: 'torus-knot',  num: '03', label: 'Torus Knot',  orbitControls: true,  scrollVh: 300  },
  { id: 'street',      num: '04', label: 'Street',      orbitControls: true, scrollVh: 4000 },
];
