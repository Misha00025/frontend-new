import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PermissionsProvider, usePermissions } from './PermissionsContext';

jest.mock('./AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../services/api', () => ({
  groupUsersAPI: {
    getGroupUsers: jest.fn(),
  },
  characterUsersAPI: {
    getCharacterUsers: jest.fn(),
  },
}));

import { useAuth } from './AuthContext';
import { groupUsersAPI, characterUsersAPI } from '../services/api';

const TestConsumer: React.FC = () => {
  const { isGroupAdmin, canEditCharacter, canDeleteCharacter, loading } = usePermissions();
  if (loading) return <div data-testid="loading">loading</div>;
  return (
    <div>
      <span data-testid="isGroupAdmin">{String(isGroupAdmin)}</span>
      <span data-testid="canEditCharacter">{String(canEditCharacter)}</span>
      <span data-testid="canDeleteCharacter">{String(canDeleteCharacter)}</span>
    </div>
  );
};

const renderAtPath = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <PermissionsProvider>
        <TestConsumer />
      </PermissionsProvider>
    </MemoryRouter>
  );

describe('PermissionsContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    (useAuth as jest.Mock).mockReturnValue({ accessToken: 'token' });
    localStorage.setItem('userId', '1');
  });

  it('устанавливает isGroupAdmin когда пользователь admin группы', async () => {
    (groupUsersAPI.getGroupUsers as jest.Mock).mockResolvedValue([
      { user: { id: 1, nickname: 'me' }, isAdmin: true },
    ]);

    renderAtPath('/group/5');

    await waitFor(() => {
      expect(screen.getByTestId('isGroupAdmin').textContent).toBe('true');
    });
  });

  it('isGroupAdmin=false когда пользователь не admin', async () => {
    (groupUsersAPI.getGroupUsers as jest.Mock).mockResolvedValue([
      { user: { id: 1, nickname: 'me' }, isAdmin: false },
    ]);

    renderAtPath('/group/5');

    await waitFor(() => {
      expect(screen.getByTestId('isGroupAdmin').textContent).toBe('false');
    });
  });

  it('устанавливает canEditCharacter когда пользователь canWrite', async () => {
    (groupUsersAPI.getGroupUsers as jest.Mock).mockResolvedValue([
      { user: { id: 1, nickname: 'me' }, isAdmin: false },
    ]);
    (characterUsersAPI.getCharacterUsers as jest.Mock).mockResolvedValue([
      { user: { id: 1 }, canWrite: true },
    ]);

    renderAtPath('/group/5/character/10');

    await waitFor(() => {
      expect(screen.getByTestId('canEditCharacter').textContent).toBe('true');
    });
  });

  it('canEditCharacter=false когда canWrite=false', async () => {
    (groupUsersAPI.getGroupUsers as jest.Mock).mockResolvedValue([
      { user: { id: 1, nickname: 'me' }, isAdmin: false },
    ]);
    (characterUsersAPI.getCharacterUsers as jest.Mock).mockResolvedValue([
      { user: { id: 1 }, canWrite: false },
    ]);

    renderAtPath('/group/5/character/10');

    await waitFor(() => {
      expect(screen.getByTestId('canEditCharacter').textContent).toBe('false');
    });
  });

  it('canDeleteCharacter=true когда пользователь admin группы', async () => {
    (groupUsersAPI.getGroupUsers as jest.Mock).mockResolvedValue([
      { user: { id: 1, nickname: 'me' }, isAdmin: true },
    ]);
    (characterUsersAPI.getCharacterUsers as jest.Mock).mockResolvedValue([
      { user: { id: 1 }, canWrite: true },
    ]);

    renderAtPath('/group/5/character/10');

    await waitFor(() => {
      expect(screen.getByTestId('canDeleteCharacter').textContent).toBe('true');
    });
  });

  it('при отсутствии accessToken все права false', async () => {
    (useAuth as jest.Mock).mockReturnValue({ accessToken: null });

    renderAtPath('/group/5');

    await waitFor(() => {
      expect(screen.getByTestId('isGroupAdmin').textContent).toBe('false');
      expect(screen.getByTestId('canEditCharacter').textContent).toBe('false');
    });
  });

  it('при пути без group все права false', async () => {
    renderAtPath('/dashboard');

    await waitFor(() => {
      expect(screen.getByTestId('isGroupAdmin').textContent).toBe('false');
    });
  });

  it('при ошибке API права сбрасываются в false', async () => {
    (groupUsersAPI.getGroupUsers as jest.Mock).mockRejectedValue(new Error('API error'));

    renderAtPath('/group/5');

    await waitFor(() => {
      expect(screen.getByTestId('isGroupAdmin').textContent).toBe('false');
    });
  });
});
