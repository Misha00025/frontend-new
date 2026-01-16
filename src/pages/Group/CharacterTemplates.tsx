// CharacterTemplates.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CharacterTemplate, CreateTemplateRequest, TemplateField, UpdateTemplateRequest } from '../../types/characterTemplates';
import { characterTemplatesAPI, groupAPI } from '../../services/api';
import CharacterTemplateModal from '../../components/Modals/CharacterModal/CharacterTemplateModal';
import commonStyles from '../../styles/common.module.css';
import buttonStyles from '../../styles/components/Button.module.css';
import uiStyles from '../../styles/ui.module.css';
import { useActionPermissions } from '../../hooks/useActionPermissions';
import IconButton from '../../components/commons/Buttons/IconButton/IconButton';
import TemplatePreview from '../../components/Views/TemplatePreview/TemplatePreview';
import { TemplateSchema } from '../../types/groupSchemas';

const CharacterTemplates: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [templates, setTemplates] = useState<CharacterTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CharacterTemplate | null>(null);
  const [schema, setSchema] = useState<TemplateSchema | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CharacterTemplate | null>(null);
  const { canEditTemplates } = useActionPermissions();

  useEffect(() => {
    if (groupId) {
      loadTemplates();
    }
  }, [groupId]);

  useEffect(() => {
    // Установить первый шаблон как выбранный по умолчанию при загрузке
    if (templates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(templates[0]);
    }
  }, [templates]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const templatesData = await characterTemplatesAPI.getTemplates(parseInt(groupId!));
      setTemplates(templatesData);
      const templateSchema = await groupAPI.getTemplateSchema(groupId ? Number(groupId) : 0)
      setSchema(templateSchema)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (templateData: any) => {
    const newTemplate = await characterTemplatesAPI.createTemplate(parseInt(groupId!), templateData);
    await loadTemplates();
    // Выбрать новый созданный шаблон
    setSelectedTemplate(newTemplate);
  };

  const handleUpdateTemplate = async (templateData: any) => {
    if (!editingTemplate) return;
    const updatedTemplate = await characterTemplatesAPI.updateTemplate(parseInt(groupId!), editingTemplate.id, templateData);
    await loadTemplates();
    // Обновить выбранный шаблон, если редактировали текущий выбранный
    if (selectedTemplate && selectedTemplate.id === editingTemplate.id) {
      setSelectedTemplate(updatedTemplate);
    }
  };
  const handleEditTemplate = () => {
    if (!selectedTemplate) return;
    setEditingTemplate(selectedTemplate);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTemplate(null);
  };

  if (loading) return <div className={commonStyles.container}>Загрузка...</div>;

  return (
    <div className={commonStyles.container}>
      <div className={uiStyles.actions} style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, marginRight: 'auto' }}>Шаблон персонажей</h1>
        
        {canEditTemplates && (
          <>
            {selectedTemplate && (<IconButton 
              title="Редактировать шаблон"
              icon="edit"
              onClick={handleEditTemplate}
            />)}
            
          </>
        )}
      </div>

      {error && <div className={commonStyles.error}>{error}</div>}
      {/* Превью выбранного шаблона */}
      {selectedTemplate ? (
        <TemplatePreview template={selectedTemplate} schema={schema || {categories: []}} />
      ) : (
        <div className={commonStyles.card}>
          <p>Шаблон ещё не создан</p>
          <button 
            className={buttonStyles.button}
            onClick={() => setIsModalOpen(true)}
          >
              Создать шаблон
          </button>
        </div>
      )}

      <CharacterTemplateModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
        editingTemplate={editingTemplate}
        title={editingTemplate ? 'Редактирование шаблона' : 'Создание шаблона'}
      />
    </div>
  );
};

export default CharacterTemplates;