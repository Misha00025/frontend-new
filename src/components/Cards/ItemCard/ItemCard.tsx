import React, { useState } from 'react';
import { GroupItem } from '../../../types/groupItems';
import { CharacterItem } from '../../../types/characterItems';
import IconButton from '../../commons/Buttons/IconButton/IconButton';
import styles from './ItemCard.module.css';
import ReactMarkdown from 'react-markdown';

interface ItemCardProps {
  item: GroupItem | CharacterItem;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  showAmount?: boolean;
}

const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onEdit,
  onDelete,
  showActions = true,
  showAmount = false
}) => {
  const isCharacterItem = 'amount' in item;
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getExtendedAttributes = () => {
    const extendedAttrs = [];
    
    extendedAttrs.push({
      key: 'price',
      name: 'Цена',
      value: item.price
    });
    
    if (showAmount && isCharacterItem && item.amount !== 1) {
      extendedAttrs.push({
        key: 'amount',
        name: 'Количество',
        value: item.amount
      });
    }
    if (showAmount && isCharacterItem && item.amount > 1) { 
      extendedAttrs.push({
        key: 'total',
        name: 'Общая стоимость',
        value: item.amount * item.price
      });
    }
    
    if (item.attributes) {
      extendedAttrs.push(...item.attributes);
    }
    
    return extendedAttrs;
  };

  const extendedAttributes = getExtendedAttributes();

  return (
    <div className={item.isSecret && !isCharacterItem ? styles.itemCardHide : styles.itemCard}>
      <div className={styles.header} onClick={() => setIsExpanded(!isExpanded)}>
        {item.image_link && (
          <img src={item.image_link} alt={item.name} className={styles.itemImage} />
        )}
        <div className={styles.titleSection}>
          <h3 className={styles.itemName} title={item.name}>{item.name}</h3>
          <div className={styles.attributesPreview}>
            {extendedAttributes.map(attr => (
              <span key={attr.key} className={styles.attributeTag}>
                {attr.name}: {attr.value}
              </span>
            ))}
          </div>
        </div>
        <button 
          className={styles.expandButton}
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          {isExpanded ? '▲' : '▼'}
        </button>
      </div>
      {isExpanded && (
        <div className={styles.expandedContent}>
          <div className={styles.description}>
            <ReactMarkdown>{item.description}</ReactMarkdown>
          </div>
          {showActions && (
            <div className={styles.actions}>
              {onEdit && (
                <IconButton 
                  icon="edit" 
                  onClick={onEdit}
                  title="Редактировать"
                  size="small"
                  variant="primary"
                />
              )}
              {onDelete && (
                <IconButton 
                  icon="delete" 
                  onClick={onDelete}
                  title="Удалить"
                  size="small"
                  variant="danger"
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ItemCard;