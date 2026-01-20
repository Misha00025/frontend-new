// components/Views/FieldRow/FieldRow.tsx
import React, { useState, useEffect, useRef } from 'react';
import { CharacterField } from '../../../../../types/characters';
import styles from './FieldRow.module.css';
import DropdownMenu, { MenuItem } from '../../../../../components/commons/DropdownMenu/DropdownMenu';

interface FieldRowProps {
  field: CharacterField;
  fieldKey: string;
  showMenu?: boolean;
  menuItems?: MenuItem[];
  onValueChange?: (newValue: string) => void;
  editable?: boolean;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, fieldKey: string) => void;
}

const FieldRow: React.FC<FieldRowProps> = ({
  field,
  fieldKey,
  showMenu = false,
  menuItems = [],
  onValueChange,
  editable = false,
  draggable = false,
  onDragStart
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(field.value.toString());
  const editInputRef = useRef<HTMLInputElement>(null);

  // Фокус на поле ввода при редактировании
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  const handleDragStart = (e: React.DragEvent) => {
    if (draggable && onDragStart) {
      onDragStart(e, fieldKey);
    }
  };

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

  const renderFieldValue = () => {
    if (isEditing) {
      return (
        <input
          ref={editInputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => {
            if (onValueChange) {
              onValueChange(editValue);
            }
            setIsEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (onValueChange) {
                onValueChange(editValue);
              }
              setIsEditing(false);
            } else if (e.key === 'Escape') {
              setEditValue(field.value.toString());
              setIsEditing(false);
            }
          }}
          className={styles.editInput}
        />
      );
    }

    if (field.maxValue !== undefined) {
      return renderProgressBar(field);
    }

    return (
      <div 
        className={editable ? styles.editableValue : styles.value}
        onClick={() => editable && setIsEditing(true)}
      >
        {formatValue(field) || '—'}
      </div>
    );
  };

  const renderMenuButton = () => {
    if (!showMenu || menuItems.length === 0) return null;

    return (
      <DropdownMenu
        items={menuItems}
        buttonTitle="Действия с полем"
        align="right"
        position="bottom"
      />
    );
  };

  return (
    <tr 
      className={styles.row}
      draggable={draggable}
      onDragStart={handleDragStart}
      style={{ cursor: draggable ? 'grab' : 'default' }}
    >
      <td className={styles.nameCell}>
        <div className={styles.nameContent}>
          <span className={styles.fieldName}>{field.name}</span>
          {renderMenuButton()}
        </div>
      </td>
      <td className={styles.valueCell}>
        {renderFieldValue()}
      </td>
    </tr>
  );
};

export default FieldRow;