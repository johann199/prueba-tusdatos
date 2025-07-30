import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterEventModal from './RegisterEventModal';
import { AuthProvider, useAuth } from '../../pages/Auth/AuthContex';
import EventApi from '../../api/EvenApi';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';

// Mock del contexto de autenticación
const mockUseAuth = jest.fn();
jest.mock('../../pages/Auth/AuthContex', () => ({
  ...jest.requireActual('../../pages/Auth/AuthContex'),
  useAuth: () => mockUseAuth(),
}));

jest.spyOn(EventApi, 'registerForEvent');

const mockOnHide = jest.fn();
const mockOnRegistrationSuccess = jest.fn();

const mockEvent = {
  id: 1,
  titulo: 'Conferencia de IA',
  lugar: 'Online',
  fecha_inicio: '2025-08-15T09:00:00Z',
  fecha_fin: '2025-08-15T17:00:00Z',
};

describe('RegisterEventModal Component', () => {
  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    mockOnHide.mockClear();
    mockOnRegistrationSuccess.mockClear();
    EventApi.registerForEvent.mockClear();
    mockUseAuth.mockClear();
  });
  afterAll(() => server.close());

  test('renders correctly when shown and user is authenticated', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, user: { id: 1, nombre: 'Test User' } });

    render(
      <RegisterEventModal
        show={true}
        onHide={mockOnHide}
        event={mockEvent}
        onRegistrationSuccess={mockOnRegistrationSuccess}
      />
    );

    expect(screen.getByText(/registrarse en "conferencia de ia"/i)).toBeInTheDocument();
    expect(screen.getByText(/estás seguro de que deseas registrarte/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirmar registro/i })).toBeInTheDocument();
  });

  test('shows error if user is not authenticated', async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });

    render(
      <RegisterEventModal
        show={true}
        onHide={mockOnHide}
        event={mockEvent}
        onRegistrationSuccess={mockOnRegistrationSuccess}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /confirmar registro/i }));

    expect(await screen.findByText(/debes iniciar sesión para registrarte en un evento/i)).toBeInTheDocument();
    expect(EventApi.registerForEvent).not.toHaveBeenCalled();
  });

  test('calls registerForEvent on confirm and shows success message', async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, user: { id: 1, nombre: 'Test User' } });
    EventApi.registerForEvent.mockResolvedValueOnce({}); // Simula éxito de la API

    render(
      <RegisterEventModal
        show={true}
        onHide={mockOnHide}
        event={mockEvent}
        onRegistrationSuccess={mockOnRegistrationSuccess}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /confirmar registro/i }));

    expect(EventApi.registerForEvent).toHaveBeenCalledWith(mockEvent.id);
    expect(screen.getByText(/registrando.../i)).toBeInTheDocument(); // Muestra spinner

    await waitFor(() => {
      expect(screen.getByText(/¡registro exitoso!/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(mockOnRegistrationSuccess).toHaveBeenCalledTimes(1);
      expect(mockOnHide).toHaveBeenCalledTimes(1);
    }, { timeout: 2000 });
  });

  test('displays error message on registration failure', async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, user: { id: 1, nombre: 'Test User' } });
    EventApi.registerForEvent.mockRejectedValueOnce({ response: { data: { detail: 'Ya estás registrado' } } }); // Simula fallo de la API

    render(
      <RegisterEventModal
        show={true}
        onHide={mockOnHide}
        event={mockEvent}
        onRegistrationSuccess={mockOnRegistrationSuccess}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /confirmar registro/i }));

    expect(EventApi.registerForEvent).toHaveBeenCalledWith(mockEvent.id);
    expect(screen.getByText(/registrando.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/ya estás registrado/i)).toBeInTheDocument();
    });
    expect(mockOnHide).not.toHaveBeenCalled();
    expect(mockOnRegistrationSuccess).not.toHaveBeenCalled();
  });

  test('closes modal on "Cancelar" button click', async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, user: { id: 1, nombre: 'Test User' } });

    render(
      <RegisterEventModal
        show={true}
        onHide={mockOnHide}
        event={mockEvent}
        onRegistrationSuccess={mockOnRegistrationSuccess}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(mockOnHide).toHaveBeenCalledTimes(1);
    expect(EventApi.registerForEvent).not.toHaveBeenCalled();
  });
});
