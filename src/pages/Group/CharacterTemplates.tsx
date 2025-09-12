import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CharacterTemplate, CreateTemplateRequest, TemplateField, UpdateTemplateRequest } from '../../types/characterTemplates';
import { characterTemplatesAPI } from '../../services/api';
import CharacterTemplateModal from '../../components/CharacterModal/CharacterTemplateModal';
import buttonStyles from '../../styles/components/Button.module.css';
import commonStyles from '../../styles/common.module.css';
import uiStyles from '../../styles/ui.module.css';

const CharacterTemplates: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [templates, setTemplates] = useState<CharacterTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CharacterTemplate | null>(null);

  useEffect(() => {
    if (groupId) {
      loadTemplates();
    }
  }, [groupId]);

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

  const handleCreateTemplate = async (templateData: CreateTemplateRequest) => {
    await characterTemplatesAPI.createTemplate(parseInt(groupId!), templateData);
    loadTemplates();
  };

  const handleUpdateTemplate = async (templateData: UpdateTemplateRequest) => {
    if (!editingTemplate) return;
    await characterTemplatesAPI.updateTemplate(parseInt(groupId!), editingTemplate.id, templateData);
    loadTemplates();
  };

  const handleDeleteTemplate = async (templateId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот шаблон?')) return;

    try {
      await characterTemplatesAPI.deleteTemplate(parseInt(groupId!), templateId);
      loadTemplates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
    }
  };

  const handleEditTemplate = (template: CharacterTemplate) => {
    setEditingTemplate(template);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTemplate(null);
  };

  if (loading) return <div className={commonStyles.container}>Загрузка...</div>;

  return (
    <div className={commonStyles.container}>
      <h1>Шаблоны персонажей</h1>

      {error && <div className={commonStyles.error}>{error}</div>}

      <div className={commonStyles.actions}>
        <button 
          className={buttonStyles.button}
          onClick={() => setIsModalOpen(true)}
        >
          Создать шаблон
        </button>
      </div>

      <div className={commonStyles.list}>
        <h2>Список шаблонов</h2>
        {templates.length === 0 ? (
          <p>Шаблонов пока нет</p>
        ) : (
          templates.map(template => (
            <div key={template.id} className={uiStyles.card}>
              <h3>{template.name}</h3>
              <p>{template.description}</p>
              
              <div className={uiStyles.fields}>
                <h4>Поля:</h4>
                {Object.entries(template.fields).map(([key, field]) => (
                  <div key={key} className={uiStyles.field}>
                    <strong>{field.name}</strong> ({key}): {field.value} - {field.description}
                  </div>
                ))}
              </div>

              <div className={uiStyles.actions}>
                <button 
                  onClick={() => handleEditTemplate(template)}
                  className={buttonStyles.button}
                >
                  Редактировать
                </button>
                <button 
                  onClick={() => handleDeleteTemplate(template.id)}
                  className={buttonStyles.button}
                >
                  Удалить
                </button>
              </div>
            </div>
          ))
        )}
      </div>

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