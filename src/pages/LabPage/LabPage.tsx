import { OrbitControls } from '@react-three/drei';
import { Scene } from '../../components/three/Scene';
import { FloatingMesh } from '../../components/three/FloatingMesh';
import { Text } from '../../components/ui/Typography';
import styles from './LabPage.module.css';

export function LabPage() {
  return (
    <div className={styles.page}>
      <Scene className={styles.canvas} cameraZ={5}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={2} />
        <pointLight position={[-8, -8, -8]} intensity={0.8} color="#a78bfa" />
        <spotLight
          position={[0, 15, 5]}
          angle={0.4}
          penumbra={0.5}
          intensity={1.5}
          color="#6ee7b7"
          castShadow
        />
        <FloatingMesh color="#a78bfa" wireframe={false} />
        <OrbitControls
          enablePan={false}
          minDistance={2}
          maxDistance={12}
          autoRotate={false}
        />
      </Scene>

      <div className={styles.overlay}>
        <Text size="xs" mono muted className={styles.hint}>
          drag to orbit · scroll to zoom
        </Text>
      </div>
    </div>
  );
}
