import { useRef } from 'react';
import type { Mesh } from 'three';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import ScrollTrigger from 'gsap/ScrollTrigger';

interface IcosahedronMeshProps {
  color?: string;
}

export function IcosahedronMesh({ color = '#6ee7b7' }: IcosahedronMeshProps) {
  const meshRef = useRef<Mesh>(null);
  const anim = useRef({ rotY: 0, rotX: 0, scrollOffset: 0 });

  useGSAP(() => {
    // Base slow rotation
    gsap.to(anim.current, {
      rotY: Math.PI * 2,
      duration: 18,
      ease: 'none',
      repeat: -1,
    });

    // Gentle tilt
    gsap.to(anim.current, {
      rotX: Math.PI * 0.15,
      duration: 6,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    // Scroll drives additional rotation — same "scroll drives the 3D" effect as old site
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: self => {
        anim.current.scrollOffset = self.progress * Math.PI * 4;
      },
    });
  });

  useFrame(() => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = anim.current.rotY + anim.current.scrollOffset;
    meshRef.current.rotation.x = anim.current.rotX;
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.2, 3]} />
      <meshStandardMaterial wireframe color={color} />
    </mesh>
  );
}
