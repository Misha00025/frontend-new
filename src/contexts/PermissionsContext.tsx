import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useLocation, useParams } from 'react-router-dom';
import { GroupUser } from '../types/groupUsers';
import { CharacterUser } from '../types/characterUsers';
import { groupUsersAPI } from '../services/api';
import { characterUsersAPI } from '../services/api';

interface PermissionsContextType {
  isGroupAdmin: boolean;
  canEditCharacter: boolean;
  canDeleteCharacter: boolean;
  loading: boolean;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const PermissionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { accessToken } = useAuth();
  const [isGroupAdmin, setIsGroupAdmin] = useState(false);
  const [canEditCharacter, setCanEditCharacter] = useState(false);
  const [canDeleteCharacter, setCanDeleteCharacter] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkPermissions = async () => {

      const pathParts = location.pathname.split('/').filter(part => part !== '');
      let groupIdStr: string | undefined;
      let characterIdStr: string | undefined;
      
      // Ищем groupId и characterId в пути
      const groupIndex = pathParts.indexOf('group');
      if (groupIndex !== -1 && pathParts.length > groupIndex + 1) {
        groupIdStr = pathParts[groupIndex + 1];
        
        // Проверяем, есть ли characterId
        const characterIndex = pathParts.indexOf('character');
        if (characterIndex !== -1 && pathParts.length > characterIndex + 1) {
          characterIdStr = pathParts[characterIndex + 1];
        }
      }
      if (!accessToken || !groupIdStr) {
        setLoading(false);
        return;
      }

      try {
        const groupId = parseInt(groupIdStr);
        
        // Проверяем права администратора группы
        const groupUsers = await groupUsersAPI.getGroupUsers(groupId);
        
        const currentUser = groupUsers.find(user => user.user.id.toString() === localStorage.getItem('userId'));
        setIsGroupAdmin(currentUser?.isAdmin || false);

        // Если есть characterId, проверяем права на редактирование персонажа
        if (characterIdStr) {
          const characterId = parseInt(characterIdStr);
          const characterUsers = await characterUsersAPI.getCharacterUsers(groupId, characterId);
          const currentCharacterUser = characterUsers.find(user => user.user.id === parseInt(localStorage.getItem('userId') || '0'));
          
          setCanEditCharacter(currentCharacterUser?.canWrite || false);
          setCanDeleteCharacter(currentUser?.isAdmin || false); // Только администраторы могут удалять персонажей
        }
      } catch (error) {
        console.error('Error checking permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    checkPermissions();
  }, [accessToken, location]);

  return (
    <PermissionsContext.Provider value={{
      isGroupAdmin,
      canEditCharacter,
      canDeleteCharacter,
      loading
    }}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};