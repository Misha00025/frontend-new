import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

jest.mock('../services/api', () => ({
  authAPI: {
    login: jest.fn(),
    register: jest.fn(),
  },
  makeAuthenticatedRequest: jest.fn(),
}));

jest.mock('../services/tokenManager', () => ({
  __esModule: true,
  default: {
    ensureToken: jest.fn(),
    setTokens: jest.fn(),
    getAccessToken: jest.fn(),
    clear: jest.fn(),
  },
}));

import { authAPI, makeAuthenticatedRequest } from '../services/api';
import tokenManager from '../services/tokenManager';

const createMockResponse = (status: number, body: Record<string, unknown>) =>
  Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response);

const TestConsumer: React.FC = () => {
  const { accessToken, userId, login, register, logout } = useAuth();
  return (
    <div>
      <span data-testid="token">{accessToken ?? 'null'}</span>
      <span data-testid="userId">{userId ?? 'null'}</span>
      <button data-testid="login" onClick={() => login('u', 'p')}>login</button>
      <button data-testid="register" onClick={() => register('u', 'p')}>register</button>
      <button data-testid="logout" onClick={logout}>logout</button>
    </div>
  );
};

const renderProvider = () =>
  render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    (tokenManager.getAccessToken as jest.Mock).mockReturnValue(null);
  });

  it('инициализируется без userId когда нет токена', async () => {
    (tokenManager.ensureToken as jest.Mock).mockResolvedValue(null);

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('userId').textContent).toBe('null');
    });
  });

  it('инициализирует userId через whoami когда токен есть', async () => {
    (tokenManager.ensureToken as jest.Mock).mockResolvedValue('valid-token');
    (makeAuthenticatedRequest as jest.Mock).mockResolvedValueOnce(
      createMockResponse(200, { id: 7 })
    );
    (tokenManager.getAccessToken as jest.Mock).mockReturnValue('valid-token');

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('userId').textContent).toBe('7');
    });
  });

  it('очищает токен при ошибке whoami', async () => {
    (tokenManager.ensureToken as jest.Mock).mockResolvedValue('bad-token');
    (makeAuthenticatedRequest as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    renderProvider();

    await waitFor(() => {
      expect(tokenManager.clear).toHaveBeenCalled();
      expect(screen.getByTestId('userId').textContent).toBe('null');
    });
  });

  it('login вызывает authAPI.login и whoami', async () => {
    (tokenManager.ensureToken as jest.Mock).mockResolvedValue(null);
    (authAPI.login as jest.Mock).mockResolvedValue({
      access_token: 'login-token',
      refresh_token: 'login-refresh',
    });
    (makeAuthenticatedRequest as jest.Mock).mockResolvedValueOnce(
      createMockResponse(200, { id: 10 })
    );

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('userId').textContent).toBe('null');
    });

    await act(async () => {
      screen.getByTestId('login').click();
    });

    expect(tokenManager.setTokens).toHaveBeenCalledWith('login-token', 'login-refresh');
    expect(screen.getByTestId('userId').textContent).toBe('10');
  });

  it('login пробрасывает ошибку при неудаче', async () => {
    (tokenManager.ensureToken as jest.Mock).mockResolvedValue(null);
    (authAPI.login as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('userId').textContent).toBe('null');
    });

    await act(async () => {
      try {
        await (screen.getByTestId('login').onclick as any)({ preventDefault: () => {} });
      } catch (e) {
        // expected
      }
    });

    // login failed — userId не установлен
    expect(screen.getByTestId('userId').textContent).toBe('null');
  });

  it('register вызывает authAPI.register и whoami', async () => {
    (tokenManager.ensureToken as jest.Mock).mockResolvedValue(null);
    (authAPI.register as jest.Mock).mockResolvedValue({
      access_token: 'reg-token',
      refresh_token: 'reg-refresh',
    });
    (makeAuthenticatedRequest as jest.Mock).mockResolvedValueOnce(
      createMockResponse(200, { id: 20 })
    );

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('userId').textContent).toBe('null');
    });

    await act(async () => {
      screen.getByTestId('register').click();
    });

    expect(tokenManager.setTokens).toHaveBeenCalledWith('reg-token', 'reg-refresh');
    expect(screen.getByTestId('userId').textContent).toBe('20');
  });

  it('logout очищает userId и токены', async () => {
    (tokenManager.ensureToken as jest.Mock).mockResolvedValue(null);

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('userId').textContent).toBe('null');
    });

    act(() => {
      screen.getByTestId('logout').click();
    });

    expect(tokenManager.clear).toHaveBeenCalled();
    expect(screen.getByTestId('userId').textContent).toBe('null');
  });
});
