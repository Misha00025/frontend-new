// contexts/TemplateEditContext.tsx
import React, { createContext, ReactNode } from 'react';

export interface TemplateEditContextType {
  editMode: boolean;
  onAddField?: () => void;
  onEditField?: (fieldKey: string) => void;
  onAddCategory?: () => void;
  onEditCategory?: (categoryKey: string) => void;
  onDeleteField?: (fieldKey: string) => void;
  onDeleteCategory?: (categoryKey: string) => void;
}

export const TemplateEditContext = createContext<TemplateEditContextType | null>(null);

interface TemplateEditProviderProps {
  children: ReactNode;
  value: TemplateEditContextType;
}

export const TemplateEditProvider: React.FC<TemplateEditProviderProps> = ({ children, value }) => {
  return (
    <TemplateEditContext.Provider value={value}>
      {children}
    </TemplateEditContext.Provider>
  );
};