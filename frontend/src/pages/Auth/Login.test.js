import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter as Router } from 'react-router-dom';
import Login from './Login';
import { AuthProvider, useAuth } from './AuthContex';

const mockLogin = jest.fn();
const mockUseAuth = jest.fn(() => ({
  isAuthenticated: false,
  isLoading: false,
  login: mockLogin,
}));


jest.mock('./AuthContex', () => ({
  ...jest.requireActual('./AuthContex'), 
  useAuth: () => mockUseAuth(), 
}));


const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Login Component', () => {
  beforeEach(() => {
    mockLogin.mockClear();
    mockUseAuth.mockClear();
    mockNavigate.mockClear();
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false, login: mockLogin });
  });

  test('renders login form correctly', () => {
    render(
      <Router>
        <Login />
      </Router>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  test('shows validation errors for empty fields', async () => {
    render(
      <Router>
        <Login />
      </Router>
    );

    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    expect(await screen.findByText(/el email es obligatorio/i)).toBeInTheDocument();
    expect(await screen.findByText(/la contraseña es obligatoria/i)).toBeInTheDocument();
  });

  test('calls login function and navigates on successful login', async () => {
    mockLogin.mockResolvedValueOnce({ access_token: 'fake-token' }); // Simula login exitoso

    render(
      <Router>
        <Login />
      </Router>
    );

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledTimes(1);
      expect(mockLogin).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });

  test('displays error message on failed login', async () => {
    mockLogin.mockRejectedValueOnce({ response: { data: { detail: 'Credenciales inválidas' } } }); // Simula login fallido

    render(
      <Router>
        <Login />
      </Router>
    );

    await userEvent.type(screen.getByLabelText(/email/i), 'wrong@example.com');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'wrongpass');
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    expect(await screen.findByText(/credenciales inválidas/i)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled(); // No debe navegar en caso de error
  });

  test('redirects to dashboard if already authenticated', async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false, login: mockLogin });

    render(
      <Router>
        <Login />
      </Router>
    );
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });
});
