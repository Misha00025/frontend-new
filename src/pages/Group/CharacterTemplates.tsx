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

const CharacterTemplates: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [template, setTemplate] = useState<CharacterTemplate | null>(null);
  const [schema, setSchema] = useState<TemplateSchema | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      // Берем первый (и единственный) шаблон, если он есть
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

  const handleCreateTemplate = async (templateData: any) => {
    const newTemplate = await characterTemplatesAPI.createTemplate(parseInt(groupId!), templateData);
    await loadTemplate();
  };

  if (loading) return <div className={commonStyles.container}>Загрузка...</div>;

  return (
    <div className={commonStyles.container}>
      <div className={uiStyles.actions} style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, marginRight: 'auto' }}>Шаблон персонажей</h1>
      </div>

      {error && <div className={commonStyles.error}>{error}</div>}

      {template ? (
        <TemplatePreview template={template} schema={schema || {categories: []}} />
      ) : (
        <div className={commonStyles.card}>
          <p>Шаблон ещё не создан</p>
          {canEditTemplates && (
            <button 
              className={buttonStyles.button}
              onClick={() => setIsModalOpen(true)}
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