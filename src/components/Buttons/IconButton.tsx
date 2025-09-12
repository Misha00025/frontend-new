import React from 'react';
import buttonStyles from '../../styles/components/Button.module.css';
import styles from './IconButton.module.css';

export type IconType = 'edit' | 'delete' | 'add' | 'view' | 'close';

interface IconButtonProps {
  icon: IconType;
  onClick: () => void;
  title: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'danger';
}

const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onClick,
  title,
  size = 'small',
  variant = 'primary'
}) => {
  return (
    <button
      className={`${buttonStyles.button} ${styles.iconButton} ${styles[size]} ${styles[variant]}`}
      onClick={onClick}
      title={title}
    >
      <span className={`${styles.icon} ${styles[icon]}`}></span>
    </button>
  );
};

export default IconButton;