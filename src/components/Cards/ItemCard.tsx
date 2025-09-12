import React from 'react';
import { GroupItem } from '../../types/groupItems';
import { CharacterItem } from '../../types/characterItems';
import buttonStyles from '../../styles/components/Button.module.css';
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
        <h3 className={styles.itemName}>{item.name}</h3>
        <p className={styles.itemDescription}>{item.description}</p>
        
        <div className={styles.itemDetails}>
          <span className={styles.itemPrice}>Цена: {item.price}</span>
          {showAmount && isCharacterItem && (
            <span className={styles.itemAmount}>Количество: {item.amount}</span>
          )}
          {showAmount && isCharacterItem && (
            <span className={styles.itemTotal}>
              Общая стоимость: {item.amount * item.price}
            </span>
          )}
        </div>
      </div>
      
      {showActions && (
        <div className={styles.itemActions}>
          {onEdit && (
            <button className={buttonStyles.button} onClick={onEdit}>
              Редактировать
            </button>
          )}
          {onDelete && (
            <button className={buttonStyles.button} onClick={onDelete}>
              Удалить
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ItemCard;