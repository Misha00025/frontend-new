// components/CharacterTableView/CharacterTableView.tsx
import React, { useState, useEffect } from 'react';
import { CharacterField } from '../../../types/characters';
import { TemplateCategory } from '../../../types/characterTemplates';
import styles from './CharacterTableView.module.css';
import { usePlatform } from '../../../hooks/usePlatform';

interface CategoryData {
  key: string;
  name: string;
  fields: [string, CharacterField, boolean][];
  subcategories?: CategoryData[];
}

interface CharacterTableViewProps {
  categorizedFields: { [category: string]: CategoryData };
  canEdit: boolean;
  onUpdateFieldValue: (fieldKey: string, newValue: string) => void;
}

const CategoryTable: React.FC<{
  category: CategoryData;
  canEdit: boolean;
  onUpdateFieldValue: (fieldKey: string, newValue: string) => void;
  level?: number;
}> = ({ category, canEdit, onUpdateFieldValue, level = 0 }) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const isMobile = usePlatform();
  const showMore = !isMobile && false;

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

  const formatValue = (field: CharacterField) => {
    if (field.maxValue !== undefined) {
      return `${field.value} / ${field.maxValue}`;
    }
    return field.value.toString();
  };

  return (
    <div className={`${styles.categorySection} ${level > 0 ? styles.subcategory : ''}`}>
      <h3 className={styles.categoryTitle} style={{ marginLeft: level > 0 ? `${level * 16}px` : '0' }}>
        {category.name}
      </h3>
      {category.fields.length > 0 && (
        <table className={styles.table}>
          <tbody>
            {category.fields.map(([fieldKey, field, isStatic]) => (
              <tr key={fieldKey} className={styles.row}>
                <td className={styles.nameCell}>{field.name}</td>
                <td className={styles.valueCell}>
                  {editingField === fieldKey ? (
                    <div className={styles.editContainer}>
                      <input
                        type="text"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onBlur={() => handleSaveEdit(fieldKey)}
                        onKeyDown={(e) => handleKeyPress(e, fieldKey)}
                        autoFocus
                        className={styles.input}
                      />
                      {field.maxValue !== undefined && (
                        <span className={styles.maxValue}> / {field.maxValue}</span>
                      )}
                    </div>
                  ) : (
                    <div
                      onClick={() => handleStartEdit(fieldKey, field.value.toString() || '')}
                      className={canEdit ? styles.editableValue : styles.value}
                    >
                      {formatValue(field) || '—'}
                    </div>
                  )}
                </td>
                {showMore && (
                  <td className={styles.formulaCell}>
                    {field.formula || '—'}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {category.subcategories && category.subcategories.map(subcategory => (
        <CategoryTable
          key={subcategory.key}
          category={subcategory}
          canEdit={canEdit}
          onUpdateFieldValue={onUpdateFieldValue}
          level={level + 1}
        />
      ))}
    </div>
  );
};

const CharacterTableView: React.FC<CharacterTableViewProps> = ({
  categorizedFields,
  canEdit,
  onUpdateFieldValue
}) => {
  return (
    <div className={styles.tableView}>
      {Object.values(categorizedFields).map(category => (
        <CategoryTable
          key={category.key}
          category={category}
          canEdit={canEdit}
          onUpdateFieldValue={onUpdateFieldValue}
        />
      ))}
    </div>
  );
};

export default CharacterTableView;