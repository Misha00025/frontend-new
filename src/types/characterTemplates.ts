export interface TemplateField {
    name: string;
    value: number;
    description: string;
    category?: string;
  }
  
  export interface TemplateGroup {
    id: number;
    name: string;
    icon: string | null;
  }
  
  export interface TemplateCategory {
    key: string;
    name: string;
    fields: string[];
  }

  export interface TemplateSchema {
    categories: TemplateCategory[];
  }

  export interface CharacterTemplate {
    id: number;
    name: string;
    description: string;
    fields: Record<string, TemplateField>;
    group: TemplateGroup;
    schema: TemplateSchema;
  }
  
  export interface CharacterTemplatesResponse {
    templates: CharacterTemplate[];
  }
  
  export interface CreateTemplateRequest {
    name: string;
    description: string;
    fields: Record<string, TemplateField>;
  }
  
  export interface UpdateTemplateRequest extends CreateTemplateRequest {}