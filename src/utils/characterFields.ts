// utils/characterFields.ts
import { Character, CharacterField } from '../types/characters';
import { CharacterTemplate } from '../types/characterTemplates';
import { TemplateCategory, TemplateSchema } from '../types/groupSchemas';

export interface CategoryData {
  key: string;
  name: string;
  fields: [string, CharacterField, boolean][];
  subcategories?: CategoryData[];
}

export const convertToTemplateCategory = (categoryData: CategoryData): TemplateCategory => {
  return {
    name: categoryData.name,
    fields: categoryData.fields.map(([fieldKey]) => fieldKey),
    categories: categoryData.subcategories ? categoryData.subcategories.map(convertToTemplateCategory) : []
  };
};

export const getFieldsByCategory = (template: TemplateCategory, character: Character, parentKey?: string): CategoryData => {
  const categoryKey = parentKey ? `${parentKey}.${template.name}` : template.name;
  const fieldsInCategory: [string, CharacterField, boolean][] = [];
  
  template.fields.forEach(fieldKey => {
    if (character.fields[fieldKey]) {
      fieldsInCategory.push([fieldKey, character.fields[fieldKey], true]);
    }
  });
  
  let subcategories: CategoryData[] = [];
  if (template.categories) {
    subcategories = template.categories.map(subCategory => 
      getFieldsByCategory(subCategory, character, categoryKey)
    );
  }
  
  return {
    key: categoryKey,
    name: template.name,
    fields: fieldsInCategory,
    subcategories: subcategories.length > 0 ? subcategories : undefined
  };
};

export const categorizeCharacterFields = (character: Character, schema: TemplateSchema | null): Record<string, CategoryData> => {
  const categorizedFields: Record<string, CategoryData> = {};
  
  if (schema) {
    schema.categories.forEach(category => {
      categorizedFields[category.name] = getFieldsByCategory(category, character);
    });
  }
  
  categorizedFields.other = {
    key: 'other',
    name: 'Другое',
    fields: []
  };
  
  Object.entries(character.fields).forEach(([key, field]) => {
    let alreadyAdded = false;
    
    // Функция для рекурсивного поиска поля в категориях
    const checkInCategory = (category: CategoryData): boolean => {
      // Проверяем поля в текущей категории
      if (category.fields.some(([fieldKey]) => fieldKey === key)) {
        return true;
      }
      
      // Рекурсивно проверяем подкатегории
      if (category.subcategories) {
        for (const subcategory of category.subcategories) {
          if (checkInCategory(subcategory)) return true;
        }
      }
      
      return false;
    };
    
    // Проверяем все категории
    for (const category of Object.values(categorizedFields)) {
      if (checkInCategory(category)) {
        alreadyAdded = true;
        break;
      }
    }
    
    if (!alreadyAdded) {
      if (field.category) {
        // Функция для рекурсивного поиска категории по короткому ключу
        const findAndAddToCategory = (category: CategoryData, targetShortKey: string): boolean => {
          // Проверяем, совпадает ли короткий ключ категории (последняя часть после точки)
          const categoryShortKey = category.key.split('.').pop();
          if (categoryShortKey === targetShortKey) {
            category.fields.push([key, field, false]);
            return true;
          }
          
          // Рекурсивно проверяем подкатегории
          if (category.subcategories) {
            for (const subcategory of category.subcategories) {
              if (findAndAddToCategory(subcategory, targetShortKey)) return true;
            }
          }
          
          return false;
        };
        
        // Ищем категорию по короткому ключу во всем дереве
        let categoryFound = false;
        for (const category of Object.values(categorizedFields)) {
          if (findAndAddToCategory(category, field.category)) {
            categoryFound = true;
            break;
          }
        }
        
        // Если категория не найдена, добавляем в "Другое"
        if (!categoryFound) {
          categorizedFields.other.fields.push([key, field, false]);
        }
      } else {
        categorizedFields.other.fields.push([key, field, false]);
      }
    }
  });
  
  if (categorizedFields.other.fields.length === 0) {
    delete categorizedFields.other;
  }
  
  return categorizedFields;
};