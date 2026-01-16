// components/Views/CharacterTableView/CategoryTable.tsx
import React from 'react';
import { CharacterField } from '../../../types/characters';
import { CategoryData } from '../../../utils/characterFields';
import styles from './CategoryTable.module.css';

interface CategoryTableProps {
  category: CategoryData;
  canEdit: boolean;
  onUpdateFieldValue: (fieldKey: string, newValue: string) => void;
  level?: number;
  onAddField?: (category?: string) => void;
}

const CategoryTable: React.FC<CategoryTableProps> = ({
  category,
  canEdit,
  onUpdateFieldValue,
  level = 0,
  onAddField = undefined
}) => {
  const formatValue = (field: CharacterField) => {
    if (field.maxValue !== undefined) {
      return `${field.value} / ${field.maxValue}`;
    }
    if (field.modifier !== undefined) {
      return `${field.value} (${field.modifier > 0 ? '+' : ''}${field.modifier})`;
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
        <span className={styles.titleCenter}>{category.name}</span>
      </h3>
      
      {category.fields.length > 0 && (
        <table className={styles.table}>
          <tbody>
            {category.fields.map(([fieldKey, field]) => (
              <tr key={fieldKey} className={styles.row}>
                <td className={styles.nameCell}>
                  {field.name}
                </td>
                <td className={styles.valueCell}>
                  <div className={styles.value}>
                    {field.maxValue !== undefined ? (
                      renderProgressBar(field)
                    ) : (
                      formatValue(field) || '—'
                    )}
                  </div>
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
          onAddField={onAddField}
        />
      ))}
    </div>
  );
};

export default CategoryTable;