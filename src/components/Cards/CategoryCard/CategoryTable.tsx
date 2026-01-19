// components/Views/CharacterTableView/CategoryTable.tsx
import React, { useContext } from 'react';
import { CategoryData } from '../../../utils/characterFields';
import styles from './CategoryTable.module.css';
import { TemplateEditContext } from '../../../contexts/TemplateEditContext';
import FieldRow from '../FieldCard/FieldRow';
import DropdownMenu, { MenuItem } from '../../control/DropdownMenu/DropdownMenu';

interface CategoryTableProps {
  category: CategoryData;
  canEdit: boolean;
  onUpdateFieldValue: (fieldKey: string, newValue: string) => void;
  level?: number;
  categoryMenuItems?: MenuItem[];
}

const CategoryTable: React.FC<CategoryTableProps> = ({
  category,
  canEdit,
  onUpdateFieldValue,
  level = 0,
  categoryMenuItems,
}) => {
  const templateEditContext = useContext(TemplateEditContext);
  const editMode = templateEditContext?.editMode || false;

  const getFieldMenuItems = (fieldKey: string): MenuItem[] => {
    if (!editMode) return [];
    
    const items: MenuItem[] = [];
    
    if (templateEditContext?.onEditField) {
      items.push({
        label: 'Редактировать поле',
        onClick: () => templateEditContext.onEditField?.(fieldKey),
      });
    }
    
    if (templateEditContext?.onDeleteField) {
      items.push({
        label: 'Удалить поле',
        onClick: () => templateEditContext.onDeleteField?.(fieldKey),
        variant: 'danger'
      });
    }
    
    return items;
  };

  const renderCategoryActions = () => {
    // Используем переданное меню или пустой массив
    const menuItems = categoryMenuItems || [];
    if (menuItems.length === 0) return null;

    return (
      <div className={styles.addButtonContainer}>
        <DropdownMenu
          items={menuItems}
          buttonTitle="Действия с категорией"
        />
      </div>
    );
  };

  return (
    <div className={`${styles.categorySection} ${level > 0 ? styles.subcategory : ''}`} style={{ margin: level > 0 ? `${level * 4}px` : '0' }}>
      <h3 className={styles.categoryTitle}>
        <span className={styles.titleCenter}>{category.name}</span>
        {renderCategoryActions()}
      </h3>
      
      {category.fields.length > 0 && (
        <table className={styles.table}>
          <tbody>
            {category.fields.map(([fieldKey, field]) => (
              <FieldRow
                key={fieldKey}
                field={field}
                fieldKey={fieldKey}
                showMenu={editMode}
                menuItems={getFieldMenuItems(fieldKey)}
                onValueChange={(newValue) => onUpdateFieldValue(fieldKey, newValue)}
                editable={false}
              />
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
          categoryMenuItems={categoryMenuItems}
        />
      ))}
    </div>
  );
};

export default CategoryTable;