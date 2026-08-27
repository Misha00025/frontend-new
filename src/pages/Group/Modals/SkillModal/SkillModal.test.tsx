import React from 'react';
import { render, screen } from '@testing-library/react';
import SkillModal from './SkillModal';
import type { GroupSkill } from '../../../../types/groupSkills';

jest.mock('../../../../styles/components/Button.module.css', () => ({ button: 'button' }));
jest.mock('../../../../styles/components/Input.module.css', () => ({ input: 'input' }));
jest.mock('../../../../styles/modal.module.css', () => ({
  overlay: 'overlay',
  modal: 'modal',
  modalBody: 'modalBody',
  formGroup: 'formGroup',
  attributesSection: 'attributesSection',
  attributeItem: 'attributeItem',
  attributeContent: 'attributeContent',
  attributeHeader: 'attributeHeader',
  attributeName: 'attributeName',
  attributeValueContainer: 'attributeValueContainer',
  addAttribute: 'addAttribute',
  attributeActions: 'attributeActions',
  buttons: 'buttons',
  error: 'error',
  customInputContainer: 'customInputContainer',
}));
jest.mock('./SkillModal.module.css', () => ({}));
jest.mock('../../../../components/commons/ModalPortal/ModalPortal', () => {
  const ModalPortal = ({ children, isOpen }: { isOpen: boolean; children: React.ReactNode }) =>
    isOpen ? <div data-testid="modal-content">{children}</div> : null;
  return ModalPortal;
});
jest.mock('@uiw/react-md-editor', () => ({
  __esModule: true,
  default: ({ value, onChange }: { value: string; onChange?: (v?: string) => void }) => (
    <textarea
      data-testid="md-editor"
      data-testid-value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  ),
}));
jest.mock('../../../../contexts/ThemeContext', () => ({
  useTheme: () => ({
    themeConfig: { type: 'preset', name: 'clean' },
    setThemeConfig: jest.fn(),
    setPreset: jest.fn(),
    setCustomColors: jest.fn(),
    getCurrentColors: jest.fn(),
    pushThemeToServer: jest.fn(),
    syncThemeFromServer: jest.fn(),
    themeSyncing: false,
    themeSyncError: null,
  }),
  getEditorColorMode: jest.fn(() => 'light'),
}));

const createMockSkill = (overrides?: Partial<GroupSkill>): GroupSkill => ({
  id: 1,
  name: 'Test Skill',
  description: 'A test skill',
  attributes: [
    { key: 'type', name: 'Type', value: 'melee' },
  ],
  isSecret: false,
  ...overrides,
});

const mockOnSave = jest.fn();

const renderModal = (editingSkill?: GroupSkill | null) => {
  render(
    <SkillModal
      isOpen
      onClose={() => {}}
      onSave={mockOnSave}
      editingSkill={editingSkill}
      availableAttributes={[]}
      possibleValuesForFilteredAttributes={{}}
      title="Тест модалка"
    />
  );
};

describe('SkillModal – required attribute value input regression', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('input в секции "Добавить атрибут" имеет required=false когда newAttribute пустой (isNew=true)', () => {
    renderModal(null);

    const valueInputs = screen.getAllByPlaceholderText('Значение');
    // При editingSkill=null нет существующих атрибутов — значение атрибута
    // рендерится только для newAttribute с isNew=true
    expect(valueInputs.length).toBe(1);
    expect(valueInputs[0]).not.toHaveAttribute('required');
  });

  it('input существующего атрибута (editingSkill) остаётся required=true, черновик нового — не required', () => {
    const skill = createMockSkill();
    renderModal(skill);

    const valueInputs = screen.getAllByPlaceholderText('Значение');
    // Должно быть 2: один для существующего атрибута (value="melee", required),
    // второй для черновика нового атрибута (value="", !required)
    expect(valueInputs.length).toBe(2);
    expect(valueInputs[0]).toHaveAttribute('required');
    expect(valueInputs[1]).not.toHaveAttribute('required');
  });
});
