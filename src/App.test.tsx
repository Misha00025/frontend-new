import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock('@uiw/react-md-editor', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({
    accessToken: 'mock-token',
    userId: 1,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  }),
}));

jest.mock('./contexts/GroupContext', () => ({
  GroupProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('./contexts/VisitedContext', () => ({
  VisitedProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('./contexts/PermissionsContext', () => ({
  PermissionsProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('./contexts/SidebarContext', () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('./contexts/DashboardSettingsContext', () => ({
  DashboardSettingsProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('./contexts/TemplateEditContext', () => ({
  TemplateEditProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(document.body).toBeInTheDocument();
  });
});
