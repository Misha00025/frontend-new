// src/utils/groupByAttributes.ts
export interface Group<T> {
    id: string;
    name: string;
    items: T[];
    children: Group<T>[];
  }
  
  export function groupBySingleAttribute<T extends { attributes?: Array<{ name: string; value: string }> }>(
    items: T[], 
    attributeName: string
  ): Group<T>[] {
    const groupsMap = new Map<string, T[]>();
    
    items.forEach(item => {
      const attribute = item.attributes?.find(attr => attr.name === attributeName);
      const groupKey = attribute?.value || `Без ${attributeName}`;
      
      if (!groupsMap.has(groupKey)) {
        groupsMap.set(groupKey, []);
      }
      groupsMap.get(groupKey)!.push(item);
    });
    
    return Array.from(groupsMap.entries()).map(([groupName, groupItems]) => ({
      id: `${attributeName}-${groupName}`,
      name: groupName,
      items: groupItems,
      children: []
    }));
  }
  
  export function groupByMultipleAttributes<T extends { attributes?: Array<{ name: string; value: string }> }>(
    items: T[], 
    attributeNames: string[]
  ): Group<T>[] {
    if (attributeNames.length === 0 || items.length === 0) {
      return [{
        id: 'all',
        name: 'Все элементы',
        items,
        children: []
      }];
    }
    
    const [currentAttribute, ...restAttributes] = attributeNames;
    const firstLevelGroups = groupBySingleAttribute(items, currentAttribute);
    
    if (restAttributes.length > 0) {
      return firstLevelGroups.map(group => ({
        ...group,
        items: [],
        children: groupByMultipleAttributes(group.items, restAttributes)
      }));
    }
    
    return firstLevelGroups;
  }
  
  export function createSkillsGrouping(skills: any[]): Group<any>[] {
    const combatSkills = skills.filter(s => 
      s.attributes?.some((a: any) => a.value.includes('Бой') || a.value.includes('оружие'))
    );
    
    const magicSkills = skills.filter(s => 
      s.attributes?.some((a: any) => a.value.includes('Магия') || a.value.includes('заклинание'))
    );
    
    const utilitySkills = skills.filter(s => 
      !combatSkills.includes(s) && !magicSkills.includes(s)
    );
    
    return [
      {
        id: 'combat',
        name: 'Боевые навыки',
        items: combatSkills,
        children: [
          {
            id: 'melee',
            name: 'Ближний бой',
            items: combatSkills.filter(s => 
              s.attributes?.some((a: any) => a.value.includes('меч') || a.value.includes('топор'))
            ),
            children: []
          },
          {
            id: 'ranged',
            name: 'Дальний бой',
            items: combatSkills.filter(s => 
              s.attributes?.some((a: any) => a.value.includes('лук') || a.value.includes('арбалет'))
            ),
            children: []
          }
        ]
      },
      {
        id: 'magic',
        name: 'Магические навыки',
        items: magicSkills,
        children: [
          {
            id: 'elemental',
            name: 'Стихийная магия',
            items: magicSkills.filter(s => 
              s.attributes?.some((a: any) => 
                a.value.includes('огонь') || 
                a.value.includes('вода') || 
                a.value.includes('земля') || 
                a.value.includes('воздух')
              )
            ),
            children: []
          }
        ]
      },
      {
        id: 'utility',
        name: 'Вспомогательные навыки',
        items: utilitySkills,
        children: []
      }
    ];
  }