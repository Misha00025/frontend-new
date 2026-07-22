import React, { useState, useEffect } from 'react';
import { useTheme, PRESET_COLORS } from '../../../contexts/ThemeContext';
import type { PresetTheme } from '../../../types/theme';
import type { CustomColors } from '../../../types/theme';
import { PRESET_LABELS } from '../../../types/theme';
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


  useEffect(() => {
    const colors = getCurrentColors();
    setCustomColorsState({
      bgPrimary: colors.bgPrimary,
      textPrimary: colors.textPrimary,
      accentColor: colors.accentColor,
    });
  }, [themeConfig, getCurrentColors]);
  if (!isOpen) return null;

  const handleColorChange = (field: keyof CustomColors) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColors = { ...customColors, [field]: e.target.value };
    setCustomColorsState(newColors);
    // Live preview: сразу применяем кастомные цвета (вычисление дополнительных происходит в контексте)
    setCustomColors(newColors);
  };

  const handleHexChange = (field: keyof CustomColors) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^#[0-9a-fA-F]{0,6}$/.test(val) || val === '') {
      const newColors = { ...customColors, [field]: val };
      setCustomColorsState(newColors);
      // Только если hex-цвет полный (6 символов после #) — сразу применяем
      if (/^#[0-9a-fA-F]{6}$/.test(val)) {
        setCustomColors(newColors);
      }
    }
  };

  const handleHexBlur = (field: keyof CustomColors) => () => {
    const val = customColors[field];
    if (!/^#[0-9a-fA-F]{6}$/.test(val)) {
      const current = getCurrentColors();
      setCustomColorsState(prev => ({ ...prev, [field]: current[field] }));
    }
  };


  const lightPresets: PresetTheme[] = ['clean', 'forest', 'ocean', 'sunset', 'lavender'];
  const darkPresets: PresetTheme[] = ['dark', 'forest-dark', 'ocean-dark', 'sunset-dark', 'lavender-dark'];

  const renderPreset = (name: PresetTheme) => {
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
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Персонализация темы</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.sectionGroup}>
          <h3 className={styles.groupTitle}>Светлые</h3>
          <div className={styles.presetsGrid}>
            {lightPresets.map(renderPreset)}
          </div>
        </div>

        <div className={styles.sectionGroup}>
          <h3 className={styles.groupTitle}>Тёмные</h3>
          <div className={styles.presetsGrid}>
            {darkPresets.map(renderPreset)}
          </div>
        </div>

        <div className={styles.customSection}>
          <h3 className={styles.customTitle}>Свои цвета</h3>
          {(['bgPrimary', 'textPrimary', 'accentColor'] as (keyof CustomColors)[]).map(field => {
            const labels: Record<keyof CustomColors, string> = {
              bgPrimary: 'Фон',
              textPrimary: 'Текст',
              accentColor: 'Акцент',
            };
            return (
              <div className={styles.colorRow} key={field}>
                <label htmlFor={`custom-${field}`}>{labels[field]}</label>
                <input
                  id={`custom-${field}`}
                  type="color"
                  value={customColors[field]}
                  onChange={handleColorChange(field)}
                />
                <input
                  type="text"
                  className={styles.hexInput}
                  value={customColors[field]}
                  onChange={handleHexChange(field)}
                  onBlur={handleHexBlur(field)}
                />
              </div>
            );
          })}

        </div>

        <div className={styles.buttons}>
          <button
            className={buttonStyles.button}
            onClick={() => setPreset('clean')}
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
