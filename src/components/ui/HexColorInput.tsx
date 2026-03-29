import { useState, useEffect } from 'react';
import styles from './HexColorInput.module.css';

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

interface HexColorInputProps {
  value: string;
  onChange: (v: string) => void;
}

export function HexColorInput({ value, onChange }: HexColorInputProps) {
  const [draft, setDraft] = useState(value);

  // Keep draft in sync when value changes externally (e.g. randomize)
  useEffect(() => {
    setDraft(value);
  }, [value]);

  const handleText = (raw: string) => {
    const v = raw.startsWith('#') ? raw : `#${raw}`;
    setDraft(v);
    if (HEX_RE.test(v)) onChange(v);
  };

  return (
    <div className={styles.row}>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={styles.swatch}
      />
      <input
        type="text"
        value={draft}
        onChange={(e) => handleText(e.target.value)}
        maxLength={7}
        spellCheck={false}
        className={styles.text}
      />
    </div>
  );
}
