import React from 'react';
import { GroupItem } from '../../types/groupItems';
import { CharacterItem } from '../../types/characterItems';
import IconButton from '../commons/Buttons/IconButton/IconButton';
import styles from './ItemCard.module.css';

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
  
  return (
    <div className={styles.itemCard}>
      {item.image_link && (
        <img src={item.image_link} alt={item.name} className={styles.itemImage} />
      )}
      
      <div className={styles.itemInfo}>
        <h3 className={styles.itemName} title={item.name}>{item.name}</h3>
        <div className={styles.descriptionContainer}>
          <p className={styles.itemDescription}>{item.description}</p>
        </div>
        
        <div className={styles.itemDetails}>
          <span className={styles.itemText}>Цена: {item.price}</span><br/>
          {showAmount && isCharacterItem && (
            <div><span className={styles.itemText}>Количество: {item.amount}</span></div>
          )}
          {showAmount && isCharacterItem && (
            <div><span className={styles.itemAccent}>
              Общая стоимость: {item.amount * item.price}
            </span></div>
          )}
        </div>
      </div>
      
      {showActions && (
        <div className={styles.itemActions}>
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
  );
};

export default ItemCard;