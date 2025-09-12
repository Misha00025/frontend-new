import { usePermissions } from '../contexts/PermissionsContext';

export const useActionPermissions = () => {
  const { isGroupAdmin, canEditCharacter, canDeleteCharacter } = usePermissions();

  const canEditGroup = isGroupAdmin;
  const canDeleteGroup = isGroupAdmin;
  const canManageGroupUsers = isGroupAdmin;
  const canCreateTemplates = isGroupAdmin;
  const canEditTemplates = isGroupAdmin;
  const canDeleteTemplates = isGroupAdmin;
  const canCreateItems = isGroupAdmin;
  const canEditItems = isGroupAdmin;
  const canDeleteItems = isGroupAdmin;
  
  const canEditThisCharacter = canEditCharacter || isGroupAdmin;
  const canDeleteThisCharacter = isGroupAdmin;
  const canManageCharacterUsers = isGroupAdmin;
  const canEditCharacterFields = canEditCharacter || isGroupAdmin;
  const canDeleteCharacterFields = canEditCharacter || isGroupAdmin;

  return {
    canEditGroup,
    canDeleteGroup,
    canManageGroupUsers,
    canCreateTemplates,
    canEditTemplates,
    canDeleteTemplates,
    canCreateItems,
    canEditItems,
    canDeleteItems,
    canEditThisCharacter,
    canDeleteThisCharacter,
    canManageCharacterUsers,
    canEditCharacterFields,
    canDeleteCharacterFields
  };
};