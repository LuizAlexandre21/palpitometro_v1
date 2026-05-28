import { render, screen } from '@testing-library/react';

jest.mock('./firebase', () => ({ auth: {}, db: {} }));
jest.mock('./hooks/useAuth', () => ({
  useAuth: () => ({
    firebaseUser: null,
    loginWithGoogle: jest.fn(),
    loginWithEmail: jest.fn(),
    registerWithEmail: jest.fn(),
    logout: jest.fn()
  })
}));
jest.mock('./hooks/useCampeonato', () => ({
  useCampeonato: () => ({
    data: null, loading: false, notFound: false,
    write: jest.fn(), createCampeonato: jest.fn(),
    findByCode: jest.fn(), joinCampeonato: jest.fn()
  })
}));
jest.mock('./hooks/useRules', () => ({
  useRules: () => ({ rules: {} }),
  DEFAULT_RULES: {}
}));

import App from './App';

test('renders landing page when not authenticated', () => {
  render(<App />);
  expect(screen.getByText(/Entrar \/ Criar conta/i)).toBeInTheDocument();
});
