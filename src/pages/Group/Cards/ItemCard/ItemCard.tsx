import React, { useState } from 'react';
import { GroupItem } from '../../../../types/groupItems';
import { CharacterItem } from '../../../../types/characterItems';
import styles from './ItemCard.module.css';
import cardStyles from '../../../../styles/card-item.module.css';
import ReactMarkdown from 'react-markdown';
import IconButton from '../../../../components/commons/Buttons/IconButton/IconButton';

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
    <div className={item.isSecret && !isCharacterItem ? styles.itemCardHide : cardStyles.card}>
      <div className={cardStyles.header} onClick={() => setIsExpanded(!isExpanded)}>
        {item.image_link && (
          <img src={item.image_link} alt={item.name} className={styles.itemImage} />
        )}
        <div className={cardStyles.titleSection}>
          <h3 className={cardStyles.name} title={item.name}>{item.name}</h3>
          <div className={cardStyles.attributesPreview}>
            {extendedAttributes.map(attr => (
              <span key={attr.key} className={cardStyles.attributeTag}>
                {attr.name}: {attr.value}
              </span>
            ))}
          </div>
        </div>
        <button 
          className={cardStyles.expandButton}
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          {isExpanded ? '▲' : '▼'}
        </button>
      </div>
      {isExpanded && (
        <div className={cardStyles.expandedContent}>
          <div className={cardStyles.description}>
            <ReactMarkdown>{item.description}</ReactMarkdown>
          </div>
          {showActions && (
            <div className={cardStyles.actions}>
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