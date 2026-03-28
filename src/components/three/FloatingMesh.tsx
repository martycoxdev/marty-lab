import { useRef } from 'react';
import type { Mesh } from 'three';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface FloatingMeshProps {
  color?: string;
  wireframe?: boolean;
}

export function FloatingMesh({
  color = '#6ee7b7',
  wireframe = false,
}: FloatingMeshProps) {
  const meshRef = useRef<Mesh>(null);

  // A plain object that GSAP animates — read by useFrame each tick.
  // This is the correct pattern: GSAP drives values, R3F reads them.
  const anim = useRef({ rotY: 0, rotX: 0, scale: 1 });

  useGSAP(() => {
    gsap.to(anim.current, {
      rotY: Math.PI * 2,
      duration: 8,
      ease: 'none',
      repeat: -1,
    });

    gsap.to(anim.current, {
      rotX: Math.PI * 0.25,
      scale: 1.05,
      duration: 3,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
  });

  useFrame(() => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = anim.current.rotY;
    meshRef.current.rotation.x = anim.current.rotX;
    meshRef.current.scale.setScalar(anim.current.scale);
  });

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[1, 0.3, 128, 16]} />
      <meshStandardMaterial
        color={color}
        wireframe={wireframe}
        roughness={0.3}
        metalness={0.6}
      />
    </mesh>
  );
}
