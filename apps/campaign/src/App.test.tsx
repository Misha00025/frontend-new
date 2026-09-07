import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

vi.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('@uiw/react-md-editor', () => ({
  __esModule: true,
  default: () => null,
}));

vi.mock('@tdn/shared/auth/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({
    accessToken: 'mock-token',
    userId: 1,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock('./contexts/GroupContext', () => ({
  GroupProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('./contexts/VisitedContext', () => ({
  VisitedProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('./contexts/PermissionsContext', () => ({
  PermissionsProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('./contexts/DashboardSettingsContext', () => ({
  DashboardSettingsProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('./contexts/TemplateEditContext', () => ({
  TemplateEditProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(document.body).toBeInTheDocument();
  });
});
