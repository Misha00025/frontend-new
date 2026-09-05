import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../../theme/ThemeContext';
import PersonalizeModal from '../../PersonalizeModal/PersonalizeModal';
import styles from './ThemeToggle.module.css';

const ThemeToggle: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { getCurrentColors } = useTheme();
  const colors = getCurrentColors();

  return (
    <>
      <button
        className={styles.toggle}
        onClick={() => setIsOpen(true)}
        title="Настроить тему"
        style={{ backgroundColor: colors.accentColor }}
      >
        🎨
      </button>
      {isOpen && createPortal(
        <PersonalizeModal isOpen={isOpen} onClose={() => setIsOpen(false)} />,
        document.body
      )}
    </>
  );
};

export default ThemeToggle;
