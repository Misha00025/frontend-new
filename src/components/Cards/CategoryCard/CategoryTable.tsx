// components/Views/CharacterTableView/CategoryTable.tsx
import React, { useState, useRef, useEffect, useContext } from 'react';
import { CharacterField } from '../../../types/characters';
import { CategoryData } from '../../../utils/characterFields';
import styles from './CategoryTable.module.css';
import IconButton from '../../commons/Buttons/IconButton/IconButton';
import { TemplateEditContext } from '../../../contexts/TemplateEditContext';

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
  level = 0,
}) => {
  const templateEditContext = useContext(TemplateEditContext);
  const editMode = templateEditContext?.editMode || false;
  
  const [showAddMenu, setShowAddMenu] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);

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

  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setShowAddMenu(false);
      }
    };

    if (showAddMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAddMenu]);

  return (
    <div className={`${styles.categorySection} ${level > 0 ? styles.subcategory : ''}`} style={{ margin: level > 0 ? `${level * 4}px` : '0' }}>
      <h3 className={styles.categoryTitle}>
        <span className={styles.titleCenter}>{category.name}</span>
        {editMode && category.key !== 'other' && (
          <div className={styles.addButtonContainer} style={{ display: 'flex', gap: '0.25rem' }}>
            <div style={{ position: 'relative' }} ref={addMenuRef}>
              <IconButton 
                icon='add'
                title='Добавить'
                onClick={() => setShowAddMenu(!showAddMenu)}
                size='small'
              />
              {showAddMenu && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius-sm)',
                  padding: '0.5rem',
                  zIndex: 100,
                  minWidth: '150px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}>
                  <button 
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      borderRadius: 'var(--border-radius-sm)',
                      marginBottom: '0.25rem'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      templateEditContext?.onAddCategory?.();
                      setShowAddMenu(false);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    Добавить категорию
                  </button>
                  <button 
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      borderRadius: 'var(--border-radius-sm)'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      templateEditContext?.onAddField?.();
                      setShowAddMenu(false);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    Добавить поле
                  </button>
                </div>
              )}
            </div>
            <IconButton 
              icon='delete'
              title='Удалить категорию'
              onClick={() => templateEditContext?.onDeleteCategory?.(category.key)}
              size='small'
              variant='danger'
            />
          </div>
        )}
      </h3>
      
      {category.fields.length > 0 && (
        <table className={styles.table}>
          <tbody>
            {category.fields.map(([fieldKey, field]) => (
              <tr key={fieldKey} className={styles.row}>
                <td className={styles.nameCell} style={{ position: 'relative' }}>
                  {field.name}
                  {editMode && (
                    <div style={{
                      position: 'absolute',
                      right: '0.5rem',
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }}>
                      <IconButton 
                        title='Удалить поле'
                        icon='delete'
                        onClick={() => templateEditContext?.onDeleteField?.(fieldKey)}
                        size='small'
                        variant='danger'
                      />
                    </div>
                  )}
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
        />
      ))}
    </div>
  );
};

export default CategoryTable;