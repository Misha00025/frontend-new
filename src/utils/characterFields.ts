// utils/characterFields.ts
import { Character, CharacterField } from '../types/characters';
import { CharacterTemplate, TemplateCategory } from '../types/characterTemplates';

export interface CategoryData {
  key: string;
  name: string;
  fields: [string, CharacterField, boolean][];
  subcategories?: CategoryData[];
}

export const convertToTemplateCategory = (categoryData: CategoryData): TemplateCategory => {
  return {
    key: categoryData.key,
    name: categoryData.name,
    fields: categoryData.fields.map(([fieldKey]) => fieldKey),
    categories: categoryData.subcategories ? categoryData.subcategories.map(convertToTemplateCategory) : []
  };
};

export const getFieldsByCategory = (template: TemplateCategory, character: Character, parentKey?: string): CategoryData => {
  const categoryKey = parentKey ? `${parentKey}.${template.key}` : template.key;
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

export const categorizeCharacterFields = (character: Character, template: CharacterTemplate | null): Record<string, CategoryData> => {
  const categorizedFields: Record<string, CategoryData> = {};
  
  if (template) {
    template.schema.categories.forEach(category => {
      categorizedFields[category.key] = getFieldsByCategory(category, character);
    });
  }
  
  categorizedFields.other = {
    key: 'other',
    name: 'Другое',
    fields: []
  };
  
  Object.entries(character.fields).forEach(([key, field]) => {
    let alreadyAdded = false;
    
    const checkInCategory = (category: CategoryData): boolean => {
      if (category.fields.some(([fieldKey]) => fieldKey === key)) {
        return true;
      }
      
      if (category.subcategories) {
        for (const subcategory of category.subcategories) {
          if (checkInCategory(subcategory)) return true;
        }
      }
      
      return false;
    };
    
    for (const category of Object.values(categorizedFields)) {
      if (checkInCategory(category)) {
        alreadyAdded = true;
        break;
      }
    }
    
    if (!alreadyAdded) {
      if (field.category && categorizedFields[field.category]) {
        const findAndAddToCategory = (category: CategoryData, targetKey: string): boolean => {
          if (category.key === targetKey) {
            category.fields.push([key, field, false]);
            return true;
          }
          
          if (category.subcategories) {
            for (const subcategory of category.subcategories) {
              if (findAndAddToCategory(subcategory, targetKey)) return true;
            }
          }
          
          return false;
        };
        
        for (const category of Object.values(categorizedFields)) {
          if (findAndAddToCategory(category, field.category)) break;
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