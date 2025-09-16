// components/CharacterTableView/CharacterTableView.tsx
import React, { useState, useEffect } from 'react';
import { CharacterField } from '../../../types/characters';
import styles from './CharacterTableView.module.css';

interface CharacterTableViewProps {
  categorizedFields: { [category: string]: [string, CharacterField, boolean][] };
  categoryNames: { [category: string]: string };
  canEdit: boolean;
  onUpdateFieldValue: (fieldKey: string, newValue: string) => void;
}

const CharacterTableView: React.FC<CharacterTableViewProps> = ({
  categorizedFields,
  categoryNames,
  canEdit,
  onUpdateFieldValue
}) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');

  const handleStartEdit = (fieldKey: string, value: string) => {
    if (!canEdit) return;
    setEditingField(fieldKey);
    setTempValue(value);
  };

  const handleSaveEdit = (fieldKey: string) => {
    if (tempValue !== '' && editingField === fieldKey) {
      onUpdateFieldValue(fieldKey, tempValue);
    }
    setEditingField(null);
  };

  const handleCancelEdit = () => {
    setEditingField(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent, fieldKey: string) => {
    if (e.key === 'Enter') {
      handleSaveEdit(fieldKey);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div className={styles.tableView}>
      {Object.entries(categorizedFields).map(([categoryKey, fields]) => {
        if (fields.length === 0) return null;

        return (
          <div key={categoryKey} className={styles.categorySection}>
            <h3 className={styles.categoryTitle}>{categoryNames[categoryKey] || categoryKey}</h3>
            <table className={styles.table}>
              <tbody>
                {fields.map(([fieldKey, field, isStatic]) => (
                  <tr key={fieldKey} className={styles.row}>
                    <td className={styles.nameCell}>{field.name}</td>
                    <td className={styles.valueCell}>
                      {editingField === fieldKey ? (
                        <input
                          type="text"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          onBlur={() => handleSaveEdit(fieldKey)}
                          onKeyDown={(e) => handleKeyPress(e, fieldKey)}
                          autoFocus
                          className={styles.input}
                        />
                      ) : (
                        <div
                          onClick={() => handleStartEdit(fieldKey, field.value.toString() || '')}
                          className={canEdit ? styles.editableValue : styles.value}
                        >
                          {field.value || '—'}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
};

export default CharacterTableView;