// CharacterTemplates.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CharacterTemplate } from '../../types/characterTemplates';
import { characterTemplatesAPI, groupAPI } from '../../services/api';
import commonStyles from '../../styles/common.module.css';
import buttonStyles from '../../styles/components/Button.module.css';
import uiStyles from '../../styles/ui.module.css';
import { useActionPermissions } from '../../hooks/useActionPermissions';
import TemplatePreview from '../../components/Views/TemplatePreview/TemplatePreview';
import { TemplateSchema } from '../../types/groupSchemas';
import IconButton from '../../components/commons/Buttons/IconButton/IconButton';
import { TemplateEditProvider } from '../../contexts/TemplateEditContext';

const CharacterTemplates: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [template, setTemplate] = useState<CharacterTemplate | null>(null);
  const [schema, setSchema] = useState<TemplateSchema | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const { canEditTemplates } = useActionPermissions();

  useEffect(() => {
    if (groupId) {
      loadTemplate();
    }
  }, [groupId]);

  const loadTemplate = async () => {
    try {
      setLoading(true);
      const templatesData = await characterTemplatesAPI.getTemplates(parseInt(groupId!));
      if (templatesData.length > 0) {
        setTemplate(templatesData[0]);
      } else {
        setTemplate(null);
      }
      const templateSchema = await groupAPI.getTemplateSchema(groupId ? Number(groupId) : 0);
      setSchema(templateSchema);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      const newTemplate = await characterTemplatesAPI.createTemplate(parseInt(groupId!), {
        name: 'Новый шаблон',
        description: '',
        fields: {}
      });
      setTemplate(newTemplate);
      setEditMode(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create template');
    }
  };

  const handleAddField = () => {
    console.log('Добавить поле в шаблон');
  };

  const handleAddCategory = () => {
    console.log('Добавить категорию в шаблон');
  };

  const handleDeleteField = (fieldKey: string) => {
    console.log('Удалить поле:', fieldKey);
  };

  const handleDeleteCategory = (categoryKey: string) => {
    console.log('Удалить категорию:', categoryKey);
  };

  if (loading) return <div className={commonStyles.container}>Загрузка...</div>;

  const templateEditContextValue = {
    editMode,
    onAddField: handleAddField,
    onAddCategory: handleAddCategory,
    onDeleteField: handleDeleteField,
    onDeleteCategory: handleDeleteCategory,
  };

  return (
    <div className={commonStyles.container}>
      <div className={uiStyles.actions} style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, marginRight: 'auto' }}>Шаблон персонажей</h1>
        
        {canEditTemplates && template && (
          <IconButton 
            title={editMode ? "Выйти из режима редактирования" : "Редактировать шаблон"}
            icon={editMode ? "close" : "edit"}
            onClick={() => setEditMode(!editMode)}
          />
        )}
      </div>

      {error && <div className={commonStyles.error}>{error}</div>}

      {template ? (
        <TemplateEditProvider value={templateEditContextValue}>
          <TemplatePreview 
            template={template} 
            schema={schema || {categories: []}} 
          />
        </TemplateEditProvider>
      ) : (
        <div className={commonStyles.card}>
          <p>Шаблон ещё не создан</p>
          {canEditTemplates && (
            <button 
              className={buttonStyles.button}
              onClick={handleCreateTemplate}
            >
              Создать шаблон
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CharacterTemplates;