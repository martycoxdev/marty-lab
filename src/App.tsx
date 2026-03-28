import { Routes, Route } from 'react-router';
import { Nav } from './components/layout/Nav/Nav';
import { HomePage } from './pages/HomePage/HomePage';
import { LabPage } from './pages/LabPage/LabPage';
import { AboutPage } from './pages/AboutPage/AboutPage';
import styles from './App.module.css';

export default function App() {
  return (
    <div className={styles.app}>
      <Nav />
      <div className={styles.pageContent}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/lab" element={<LabPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </div>
    </div>
  );
}
