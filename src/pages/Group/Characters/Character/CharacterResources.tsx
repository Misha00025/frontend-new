import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Character, CharacterField } from '../../../../types/characters';
import { CharacterItem } from '../../../../types/characterItems';
import { ResourceSettings } from '../../../../types/resourceSettings';
import { charactersAPI, characterItemsAPI } from '../../../../services/api';
import commonStyles from '../../../../styles/common.module.css';
import modalStyles from '../../../../styles/modal.module.css';
import buttonStyles from '../../../../styles/components/Button.module.css';
import EvaluatedInput from '../../../../components/commons/EvaluatedInput/EvaluatedInput';
import { useActionPermissions } from '../../../../hooks/useActionPermissions';
import ResourcesSettingsModal from '../Modals/ResourcesSettingsModal/ResourcesSettingsModal';
import styles from './CharacterResources.module.css';

const CharacterResources: React.FC = () => {
  const { groupId, characterId } = useParams<{ groupId: string; characterId: string }>();
  const [character, setCharacter] = useState<Character | null>(null);
  const [items, setItems] = useState<CharacterItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<ResourceSettings | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { canEditThisCharacter } = useActionPermissions();

  useEffect(() => {
    if (groupId && characterId) {
      loadData();
    }
  }, [groupId, characterId]);

  useEffect(() => {
    if (!groupId || !characterId) return;
    const saved = localStorage.getItem(`character_resources_${groupId}_${characterId}`);
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch {
        setSettings(null);
      }
    } else {
      setSettings(null);
    }
  }, [groupId, characterId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [charData, itemsData] = await Promise.all([
        charactersAPI.getCharacter(Number(groupId), Number(characterId)),
        characterItemsAPI.getCharacterItems(Number(groupId), Number(characterId)),
      ]);
      setCharacter(charData);
      setItems(itemsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = (newSettings: ResourceSettings) => {
    setSettings(newSettings);
    localStorage.setItem(`character_resources_${groupId}_${characterId}`, JSON.stringify(newSettings));
    setIsModalOpen(false);
  };

  const handleUpdateField = async (fieldKey: string, newValue: string) => {
    if (!character) return;
    try {
      const field = character.fields[fieldKey];
      const updatedField: CharacterField = { ...field, value: Number(newValue) };
      const updatedCharacter = await charactersAPI.updateCharacter(
        Number(groupId), Number(characterId),
        { fields: { [fieldKey]: updatedField } }
      );
      setCharacter(updatedCharacter);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update field');
    }
  };

  const handleUpdateItemAmount = async (itemId: number, newAmount: number) => {
    try {
      const item = items.find(i => i.id === itemId);
      if (!item) return;
      const updatedItem = await characterItemsAPI.updateCharacterItem(
        Number(groupId), Number(characterId), itemId,
        { name: item.name, description: item.description, amount: newAmount, price: item.price, image_link: item.image_link || undefined }
      );
      setItems(prev => prev.map(item => item.id === itemId ? updatedItem : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item amount');
    }
  };

  const selectedFields = settings && character
    ? settings.fields
        .map(key => [key, character.fields[key]] as [string, CharacterField])
        .filter(([, field]) => field !== undefined)
    : [];

  const selectedItems = settings && items
    ? settings.items
        .map(id => items.find(item => item.id === id))
        .filter((item): item is CharacterItem => item !== undefined)
    : [];

  const hasResources = settings && (selectedFields.length > 0 || selectedItems.length > 0);

  if (loading) return <div className={commonStyles.container}>Загрузка...</div>;

  return (
    <div className={commonStyles.container}>
      {error && <div className={modalStyles.error}>{error}</div>}

      {!hasResources ? (
        <div className={styles.emptyState}>
          <p>Ресурсы не настроены.</p>
          <div className={styles.emptyActions}>
            <button
              className={buttonStyles.button}
              onClick={() => setIsModalOpen(true)}
            >
              Настроить ресурсы
            </button>
            <Link to="stats" className={buttonStyles.button}>
              Перейти к статам
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          <button
            className={styles.settingsButton}
            onClick={() => setIsModalOpen(true)}
            title="Настроить ресурсы"
          >
            ⚙️
          </button>
          <div className={styles.resourcesGrid}>
            {selectedFields.length > 0 && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Поля</h3>
                <table className={styles.table}>
                  <tbody>
                    {selectedFields.map(([fieldKey, field]) => (
                      <FieldResourceRow
                        key={fieldKey}
                        field={field}
                        editable={canEditThisCharacter}
                        onUpdate={(value) => handleUpdateField(fieldKey, value)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selectedItems.length > 0 && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Предметы</h3>
                <table className={styles.table}>
                  <tbody>
                    {selectedItems.map(item => (
                      <ItemResourceRow
                        key={item.id}
                        item={item}
                        editable={canEditThisCharacter}
                        onUpdateAmount={(amount) => handleUpdateItemAmount(item.id, amount)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      <ResourcesSettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSettings}
        fields={character ? Object.entries(character.fields) : []}
        items={items}
        initialSettings={settings || { fields: [], items: [] }}
      />
    </div>
  );
};

interface FieldResourceRowProps {
  field: CharacterField;
  editable: boolean;
  onUpdate: (value: string) => void;
}

const FieldResourceRow: React.FC<FieldResourceRowProps> = ({ field, editable, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);

  const renderProgressBar = (f: CharacterField) => {
    const percentage = (f.value / f.maxValue!) * 100;
    return (
      <div className={styles.progressContainer}>
        <div
          className={styles.progressBar}
          style={{
            width: `${percentage}%`,
            backgroundColor: `hsl(${percentage * 1.2}, 70%, 45%)`
          }}
        >
          <span className={styles.progressText}>{f.value}/{f.maxValue}</span>
        </div>
      </div>
    );
  };

  const renderValue = () => {
    if (isEditing && editable) {
      return (
        <EvaluatedInput
          initialValue={field.value.toString()}
          onCommit={(value) => {
            onUpdate(value);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
          className={styles.editInput}
          autoFocus
        />
      );
    }

    return (
      <div
        className={editable ? styles.editableValue : styles.resourceValue}
        onClick={() => editable && setIsEditing(true)}
      >
        {field.maxValue !== undefined ? renderProgressBar(field) : field.value}
      </div>
    );
  };

  return (
    <tr className={styles.row}>
      <td className={styles.nameCell}><span className={styles.fieldName}>{field.name}</span></td>
      <td className={styles.valueCell}>{renderValue()}</td>
    </tr>
  );
};

interface ItemResourceRowProps {
  item: CharacterItem;
  editable: boolean;
  onUpdateAmount: (amount: number) => void;
}

const ItemResourceRow: React.FC<ItemResourceRowProps> = ({ item, editable, onUpdateAmount }) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <tr className={styles.row}>
      <td className={styles.nameCell}>{item.name}</td>
      <td className={styles.valueCell}>
        <div className={styles.itemControls}>
          {editable && (
            <button
              className={styles.itemButton}
              onClick={() => onUpdateAmount(Math.max(0, item.amount - 1))}
              disabled={item.amount <= 0}
            >
              -1
            </button>
          )}
          {isEditing && editable ? (
            <EvaluatedInput
              initialValue={item.amount.toString()}
              onCommit={(value) => {
                const num = Math.max(0, parseInt(value) || 0);
                onUpdateAmount(num);
                setIsEditing(false);
              }}
              onCancel={() => setIsEditing(false)}
              className={styles.editInput}
              autoFocus
            />
          ) : (
            <span
              className={editable ? styles.editableValue : styles.resourceValue}
              onClick={() => editable && setIsEditing(true)}
            >
              {item.amount}
            </span>
          )}
          {editable && (
            <button
              className={styles.itemButton}
              onClick={() => onUpdateAmount(item.amount + 1)}
            >
              +1
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default CharacterResources;
