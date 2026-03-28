import { Heading, Text } from '../../components/ui/Typography';
import styles from './AboutPage.module.css';

export function AboutPage() {
  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <Heading as="h1" size="4xl">
          About
        </Heading>
        <Text muted size="lg" style={{ marginTop: '1rem', maxWidth: '480px' }}>
          This is a placeholder. More to come — maybe a CV, maybe a portfolio,
          maybe something else.
        </Text>
      </div>
    </main>
  );
}
