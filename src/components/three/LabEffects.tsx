import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useTheme } from '../../context/ThemeContext';

interface LabEffectsProps {
  /** Multiplier applied on top of the theme-default intensity (1 = default) */
  bloomMultiplier?: number;
}

export function LabEffects({ bloomMultiplier = 1 }: LabEffectsProps) {
  const { theme } = useTheme();

  if (theme === 'light') {
    return (
      <EffectComposer>
        <Bloom
          mipmapBlur
          luminanceThreshold={0.6}
          intensity={0.4 * bloomMultiplier}
          luminanceSmoothing={0.4}
        />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer>
      <Bloom
        mipmapBlur
        luminanceThreshold={0.05}
        intensity={2.5 * bloomMultiplier}
        luminanceSmoothing={0.2}
      />
    </EffectComposer>
  );
}
