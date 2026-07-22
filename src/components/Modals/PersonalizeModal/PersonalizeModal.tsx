import React, { useState } from 'react';
import { useTheme, PRESET_COLORS } from '../../../contexts/ThemeContext';
import type { PresetTheme } from '../../../types/theme';
import type { CustomColors } from '../../../types/theme';
import { PRESET_LABELS } from '../../../types/theme';
import modalStyles from '../../../styles/modal.module.css';
import buttonStyles from '../../../styles/components/Button.module.css';
import styles from './PersonalizeModal.module.css';

interface PersonalizeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PersonalizeModal: React.FC<PersonalizeModalProps> = ({ isOpen, onClose }) => {
  const { themeConfig, setPreset, setCustomColors, getCurrentColors } = useTheme();
  const currentColors = getCurrentColors();
  const [customColors, setCustomColorsState] = useState<CustomColors>({
    bgPrimary: currentColors.bgPrimary,
    textPrimary: currentColors.textPrimary,
    accentColor: currentColors.accentColor,
  });

  if (!isOpen) return null;

  const handleColorChange = (field: keyof CustomColors) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomColorsState(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleApplyCustom = () => {
    setCustomColors(customColors);
  };

  const lightPresets: PresetTheme[] = ['forest', 'ocean', 'sunset', 'lavender'];
  const darkPresets: PresetTheme[] = ['dark', 'forest-dark', 'ocean-dark', 'sunset-dark', 'lavender-dark'];

  return (
    <div className={modalStyles.overlay} onClick={onClose}>
      <div className={modalStyles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        <h2 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Персонализация темы
        </h2>

        <div className={styles.sectionGroup}>
          <h3 className={styles.groupTitle}>Светлые</h3>
          <div className={styles.presetsGrid}>
            {lightPresets.map(name => {
              const colors = PRESET_COLORS[name];
              const isActive = themeConfig.type === 'preset' && themeConfig.name === name;
              return (
                <div
                  key={name}
                  className={`${styles.presetCard} ${isActive ? styles.presetCardActive : ''}`}
                  onClick={() => setPreset(name)}
                >
                  <div
                    className={styles.colorPreview}
                    style={{
                      background: `linear-gradient(135deg, ${colors.bgPrimary} 50%, ${colors.accentColor} 50%)`,
                    }}
                  />
                  <span className={styles.presetLabel}>{PRESET_LABELS[name]}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.sectionGroup}>
          <h3 className={styles.groupTitle}>Тёмные</h3>
          <div className={styles.presetsGrid}>
            {darkPresets.map(name => {
              const colors = PRESET_COLORS[name];
              const isActive = themeConfig.type === 'preset' && themeConfig.name === name;
              return (
                <div
                  key={name}
                  className={`${styles.presetCard} ${isActive ? styles.presetCardActive : ''}`}
                  onClick={() => setPreset(name)}
                >
                  <div
                    className={styles.colorPreview}
                    style={{
                      background: `linear-gradient(135deg, ${colors.bgPrimary} 50%, ${colors.accentColor} 50%)`,
                    }}
                  />
                  <span className={styles.presetLabel}>{PRESET_LABELS[name]}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.customSection}>
          <h3 className={styles.customTitle}>Свои цвета</h3>
          <div className={styles.colorRow}>
            <label htmlFor="custom-bg">Фон</label>
            <input
              id="custom-bg"
              type="color"
              value={customColors.bgPrimary}
              onChange={handleColorChange('bgPrimary')}
            />
          </div>
          <div className={styles.colorRow}>
            <label htmlFor="custom-text">Текст</label>
            <input
              id="custom-text"
              type="color"
              value={customColors.textPrimary}
              onChange={handleColorChange('textPrimary')}
            />
          </div>
          <div className={styles.colorRow}>
            <label htmlFor="custom-accent">Акцент</label>
            <input
              id="custom-accent"
              type="color"
              value={customColors.accentColor}
              onChange={handleColorChange('accentColor')}
            />
          </div>
          <button className={buttonStyles.button} onClick={handleApplyCustom} style={{ marginTop: '0.75rem', width: '100%' }}>
            Применить свои цвета
          </button>
        </div>

        <div className={styles.buttons}>
          <button
            className={buttonStyles.button}
            onClick={() => setPreset('forest')}
            style={{ backgroundColor: 'var(--text-secondary)' }}
          >
            Сбросить
          </button>
          <button className={buttonStyles.button} onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonalizeModal;
