import type { ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';

interface SceneProps {
  className?: string;
  children: ReactNode;
  cameraZ?: number;
}

export function Scene({ className, children, cameraZ = 5 }: SceneProps) {
  return (
    <Canvas
      className={className}
      camera={{ position: [0, 0, cameraZ], fov: 75 }}
      gl={{ antialias: true }}
      dpr={[1, 2]}
    >
      {children}
    </Canvas>
  );
}
