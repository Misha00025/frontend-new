// CharacterTemplates.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CharacterTemplate, CreateTemplateRequest, TemplateField, UpdateTemplateRequest } from '../../types/characterTemplates';
import { characterTemplatesAPI } from '../../services/api';
import CharacterTemplateModal from '../../components/Modals/CharacterModal/CharacterTemplateModal';
import commonStyles from '../../styles/common.module.css';
import uiStyles from '../../styles/ui.module.css';
import { useActionPermissions } from '../../hooks/useActionPermissions';
import IconButton from '../../components/Buttons/IconButton';
import TemplatePreview from '../../components/Views/TemplatePreview/TemplatePreview';

const CharacterTemplates: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [templates, setTemplates] = useState<CharacterTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CharacterTemplate | null>(null);
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

  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return;
    
    if (!window.confirm('Вы уверены, что хотите удалить этот шаблон?')) return;

    try {
      await characterTemplatesAPI.deleteTemplate(parseInt(groupId!), selectedTemplate.id);
      await loadTemplates();
      // Сбросить выбранный шаблон после удаления
      setSelectedTemplate(templates.length > 1 ? templates[0] : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
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

  const handleTemplateSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = parseInt(event.target.value);
    const template = templates.find(t => t.id === templateId) || null;
    setSelectedTemplate(template);
  };

  if (loading) return <div className={commonStyles.container}>Загрузка...</div>;

  return (
    <div className={commonStyles.container}>
      <div className={uiStyles.actions} style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, marginRight: 'auto' }}>Шаблоны персонажей</h1>
        
        {canEditTemplates && (
          <>
            <IconButton 
              title="Создать шаблон"
              icon="add"
              onClick={() => setIsModalOpen(true)}
            />
            <IconButton 
              title="Редактировать шаблон"
              icon="edit"
              onClick={handleEditTemplate}
            />
            <IconButton 
              title="Удалить шаблон"
              icon="delete"
              onClick={handleDeleteTemplate}
              variant="danger"
            />
          </>
        )}
      </div>

      {error && <div className={commonStyles.error}>{error}</div>}

      {/* Выпадающий список для выбора шаблона */}
      <div className={commonStyles.formGroup} style={{ marginBottom: '2rem' }}>
        <label htmlFor="template-select">Выберите шаблон:</label>
        <select 
          id="template-select"
          value={selectedTemplate?.id || ''}
          onChange={handleTemplateSelect}
          className={commonStyles.formControl}
          style={{ 
            padding: '0.5rem',
            borderRadius: 'var(--border-radius-sm)',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            maxWidth: '300px'
          }}
        >
          <option value="">-- Выберите шаблон --</option>
          {templates.map(template => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
      </div>

      {/* Превью выбранного шаблона */}
      {selectedTemplate ? (
        <TemplatePreview template={selectedTemplate} />
      ) : (
        <div className={commonStyles.card}>
          <p>Выберите шаблон из списка или создайте новый</p>
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