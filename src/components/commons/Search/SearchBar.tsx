// components/SearchAndFilterBar/SearchAndFilterBar.tsx
import React, { useState, useEffect } from 'react';
import inputStyles from '../../../styles/components/Input.module.css';
import buttonStyles from '../../../styles/components/Button.module.css';
import styles from './SearchBar.module.css';

interface SearchAndFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedAttribute: string;
  onAttributeChange: (value: string) => void;
  attributeValue: string;
  onAttributeValueChange: (value: string) => void;
  availableAttributes: string[];
  attributeValues: string[];
  onClearFilters: () => void;
  resultsCount: number;
  totalCount: number;
  placeholder?: string;
  attributeLabel?: string;
  valueLabel?: string;
  showPriceFilter?: boolean;
  priceRange?: { min: string; max: string };
  onPriceRangeChange?: (field: 'min' | 'max', value: string) => void;
  defaultCollapsed?: boolean;
}

const SearchBar: React.FC<SearchAndFilterBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedAttribute,
  onAttributeChange,
  attributeValue,
  onAttributeValueChange,
  availableAttributes,
  attributeValues,
  onClearFilters,
  resultsCount,
  totalCount,
  placeholder = "Поиск...",
  attributeLabel = "Атрибут",
  valueLabel = "Значение",
  showPriceFilter = false,
  priceRange = { min: '', max: '' },
  onPriceRangeChange,
  defaultCollapsed = true,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  // Определяем, есть ли активные фильтры
  useEffect(() => {
    const active = 
      !!searchTerm || 
      !!selectedAttribute || 
      !!attributeValue || 
      (showPriceFilter && (!!priceRange.min || !!priceRange.max));
    setHasActiveFilters(active);
  }, [searchTerm, selectedAttribute, attributeValue, priceRange, showPriceFilter]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const activeFiltersCount = [
    searchTerm ? 1 : 0,
    selectedAttribute ? 1 : 0,
    attributeValue ? 1 : 0,
    showPriceFilter && priceRange.min ? 1 : 0,
    showPriceFilter && priceRange.max ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className={`${styles.container} ${isCollapsed ? styles.collapsed : styles.expanded}`}>
      <div className={styles.header}>
        <div className={styles.searchRow}>
          <div className={styles.searchInput}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className={inputStyles.input}
              placeholder={placeholder}
            />
          </div>
          
          <div className={styles.headerActions}>
            <div className={styles.resultsBadge}>
              {resultsCount}/{totalCount}
            </div>
            
            {hasActiveFilters && (
              <div className={styles.filtersBadge}>
                {activeFiltersCount}
              </div>
            )}
            
            <button
              onClick={onClearFilters}
              className={`${buttonStyles.button} ${styles.clearButton} ${!hasActiveFilters ? styles.hidden : ''}`}
              disabled={!hasActiveFilters}
              title="Очистить фильтры"
            >
              ×
            </button>
            
            <button
              onClick={toggleCollapse}
              className={`${buttonStyles.button} ${styles.toggleButton}`}
              title={isCollapsed ? "Показать фильтры" : "Скрыть фильтры"}
            >
              {isCollapsed ? "▼" : "▲"}
            </button>
          </div>
        </div>
      </div>
      
      {!isCollapsed && (
        <div className={styles.filtersContent}>
          <div className={styles.filtersGrid}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>{attributeLabel}:</label>
              <select
                value={selectedAttribute}
                onChange={(e) => onAttributeChange(e.target.value)}
                className={inputStyles.input}
              >
                <option value="">Все {attributeLabel.toLowerCase()}ы</option>
                {availableAttributes.map(attr => (
                  <option key={attr} value={attr}>{attr}</option>
                ))}
              </select>
            </div>
            
            {selectedAttribute && (
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>{valueLabel}:</label>
                <select
                  value={attributeValue}
                  onChange={(e) => onAttributeValueChange(e.target.value)}
                  className={inputStyles.input}
                >
                  <option value="">Все {valueLabel.toLowerCase()}и</option>
                  {attributeValues.map(value => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>
              </div>
            )}
            
            {showPriceFilter && onPriceRangeChange && (
              <>
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Цена от:</label>
                  <input
                    type="number"
                    value={priceRange.min}
                    onChange={(e) => onPriceRangeChange('min', e.target.value)}
                    className={inputStyles.input}
                    placeholder="0"
                    min="0"
                  />
                </div>
                
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Цена до:</label>
                  <input
                    type="number"
                    value={priceRange.max}
                    onChange={(e) => onPriceRangeChange('max', e.target.value)}
                    className={inputStyles.input}
                    placeholder="∞"
                    min="0"
                  />
                </div>
              </>
            )}
          </div>
          
          <div className={styles.filterActions}>
            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className={`${buttonStyles.button} ${styles.clearFullButton}`}
              >
                Очистить все фильтры
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;