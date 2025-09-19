// components/Views/CharacterTableView/CategoryTable.tsx
import React, { useState } from 'react';
import { CharacterField } from '../../../types/characters';
import { CategoryData } from '../../../utils/characterFields';
import styles from './CategoryTable.module.css';
import IconButton from '../../Buttons/IconButton';

interface CategoryTableProps {
  category: CategoryData;
  canEdit: boolean;
  onUpdateFieldValue: (fieldKey: string, newValue: string) => void;
  level?: number;
}

const CategoryTable: React.FC<CategoryTableProps> = ({
  category,
  canEdit,
  onUpdateFieldValue,
  level = 0
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

  const formatValue = (field: CharacterField) => {
    if (field.maxValue !== undefined) {
      return `${field.value} / ${field.maxValue}`;
    }
    return field.value.toString();
  };

  const renderProgressBar = (field: CharacterField) => {
    const percentage = (field.value / field.maxValue!) * 100;
    return (
      <div className={styles.progressContainer}>
        <div 
          className={styles.progressBar}
          style={{ 
            width: `${percentage}%`,
            backgroundColor: `hsl(${percentage * 1.2}, 70%, 45%)`
          }}
        >
          <span className={styles.progressText}>
            {field.value}/{field.maxValue}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className={`${styles.categorySection} ${level > 0 ? styles.subcategory : ''}`} style={{ margin: level > 0 ? `${level * 4}px` : '0' }}>
      <h3 className={styles.categoryTitle}>
        {category.name}
      </h3>
      {category.fields.length > 0 && (
        <table className={styles.table}>
          <tbody>
            {category.fields.map(([fieldKey, field, isStatic]) => (
              <tr key={fieldKey} className={styles.row}>
                <td className={styles.nameCell}>
                  {field.name}
                  {/* <IconButton 
                    title='Редактировать поле'
                    icon='edit'
                    onClick={()=>null}
                    variant='secondary'
                  /> */}
                </td>
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
                      {field.maxValue !== undefined ? (
                        renderProgressBar(field)
                      ) : (
                        formatValue(field) || '—'
                      )}
                    </div>
                  )}
                </td>
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

export default CategoryTable;