import { Scene } from '../../components/three/Scene';
import { IcosahedronMesh } from '../../components/three/IcosahedronMesh';
import { CvHero } from '../../components/cv/CvHero';
import { SkillsSection } from '../../components/cv/SkillsSection';
import { ExperienceSection } from '../../components/cv/ExperienceSection';
import { ContactSection } from '../../components/cv/ContactSection';
import { cvData } from '../../data/experience';
import styles from './CvPage.module.css';

export function CvPage() {
  return (
    <div className={styles.page}>
      <div className={styles.background}>
        <Scene>
          <IcosahedronMesh />
        </Scene>
      </div>

      <div className={styles.content}>
        <CvHero name={cvData.name} descriptors={cvData.descriptors} />
        <SkillsSection
          stats={cvData.stats}
          statement={cvData.statement}
          skills={cvData.skills}
        />
        <ExperienceSection jobs={cvData.jobs} />
        <ContactSection linkedin={cvData.contact.linkedin} email={cvData.contact.email} />
      </div>
    </div>
  );
}
