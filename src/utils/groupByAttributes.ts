// src/utils/groupByAttribute.ts
export interface Group<T> {
    id: string;
    name: string;
    items: T[];
  }
  
  /**
   * Группирует элементы по значению указанного атрибута
   * @param items Массив элементов
   * @param attributeName Название атрибута для группировки
   */
  export function groupByAttribute<T extends { 
    attributes?: Array<{ name: string; value: string }> 
  }>(
    items: T[], 
    attributeName: string
  ): Group<T>[] {
    // Создаем Map для группировки
    const groupsMap = new Map<string, T[]>();
    
    // Проходим по всем элементам
    items.forEach(item => {
      // Ищем атрибут с нужным именем
      const attribute = item.attributes?.find(attr => attr.name === attributeName);
      const groupName = attributeName + ": " + (attribute?.value || `Не задано`);
      
      // Добавляем элемент в соответствующую группу
      if (!groupsMap.has(groupName)) {
        groupsMap.set(groupName, []);
      }
      groupsMap.get(groupName)!.push(item);
    });
    
    // Преобразуем Map в массив групп
    const groups = Array.from(groupsMap.entries()).map(([groupName, groupItems]) => ({
      id: `${attributeName}-${groupName}`,
      name: groupName,
      items: groupItems,
    }));
    
    // Сортируем группы по алфавиту, "Без X" в конце
    return groups.sort((a, b) => {
      if (a.name.endsWith('Не задано')) return 1;
      if (b.name.endsWith('Не задано')) return -1;
      return a.name.localeCompare(b.name);
    });
  }