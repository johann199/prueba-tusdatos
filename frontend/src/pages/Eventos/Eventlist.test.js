import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter as Router } from 'react-router-dom';
import EventList from './EventList';
import { AuthProvider } from '../Auth/AuthContex'; 
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw'; 

// Mock del contexto de autenticación para EventList
jest.mock('../Auth/AuthContex', () => ({
  ...jest.requireActual('../Auth/AuthContex'),
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: { id: 1, nombre: 'Test User', role: 'USER' },
  }),
}));

describe('EventList Component', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test('renders event list and displays events from API', async () => {
    render(
      <Router>
        <AuthProvider>
          <EventList />
        </AuthProvider>
      </Router>
    );

    expect(screen.getByText(/cargando.../i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/gestión de eventos/i)).toBeInTheDocument();
      expect(screen.getByText('Evento de Prueba 1')).toBeInTheDocument();
      expect(screen.getByText('Evento de Prueba 2')).toBeInTheDocument();
      expect(screen.getByText('Creador Test')).toBeInTheDocument();
      expect(screen.getByText('Otro Creador')).toBeInTheDocument();
    });
  });

  test('opens CreateEventModal when "Crear Evento" button is clicked', async () => {
    jest.mock('./CreateEventModal', () => ({ show, onClose, onEventCreated }) => (
      show ? <div data-testid="create-event-modal">Create Event Modal Content</div> : null
    ));

    render(
      <Router>
        <AuthProvider>
          <EventList />
        </AuthProvider>
      </Router>
    );

    await waitFor(() => expect(screen.getByText('Evento de Prueba 1')).toBeInTheDocument()); // Espera la carga inicial

    await userEvent.click(screen.getByRole('button', { name: /crear evento/i }));

    expect(screen.getByTestId('create-event-modal')).toBeInTheDocument();
  });

  test('opens RegisterEventModal when "Registrarme" button is clicked', async () => {
    jest.mock('./RegisterEventModal', () => ({ show, onHide, event, onRegistrationSuccess }) => (
      show ? <div data-testid="register-event-modal">Register Event Modal Content for {event.titulo}</div> : null
    ));

    render(
      <Router>
        <AuthProvider>
          <EventList />
        </AuthProvider>
      </Router>
    );

    await waitFor(() => expect(screen.getByText('Evento de Prueba 1')).toBeInTheDocument()); // Espera la carga inicial

    const registerButton = screen.getAllByRole('button', { name: /registrarme/i })[0];
    await userEvent.click(registerButton);

    expect(screen.getByTestId('register-event-modal')).toBeInTheDocument();
    expect(screen.getByText(/register event modal content for evento de prueba 1/i)).toBeInTheDocument();
  });

  test('opens EventDetailsModal when "Detalles" button is clicked', async () => {
    jest.mock('./EventDetailsModal', () => ({ show, onHide, event }) => (
      show ? <div data-testid="details-event-modal">Details Modal Content for {event.titulo}</div> : null
    ));

    render(
      <Router>
        <AuthProvider>
          <EventList />
        </AuthProvider>
      </Router>
    );

    await waitFor(() => expect(screen.getByText('Evento de Prueba 1')).toBeInTheDocument());

    const detailsButton = screen.getAllByRole('button', { name: /detalles/i })[0];
    await userEvent.click(detailsButton);

    expect(screen.getByTestId('details-event-modal')).toBeInTheDocument();
    expect(screen.getByText(/details modal content for evento de prueba 1/i)).toBeInTheDocument();
  });

  test('calls delete API and removes event from list on "Eliminar" click', async () => {
    server.use(
      http.delete('http://localhost:8000/api/eventos/eliminar/:id', () => {
        return HttpResponse.json({ message: 'Evento eliminado exitosamente' }, { status: 200 });
      })
    );

    jest.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <Router>
        <AuthProvider>
          <EventList />
        </AuthProvider>
      </Router>
    );

    await waitFor(() => expect(screen.getByText('Evento de Prueba 1')).toBeInTheDocument());

    const deleteButton = screen.getAllByRole('button', { name: /eliminar/i })[0];
    await userEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText('Evento de Prueba 1')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Evento de Prueba 2')).toBeInTheDocument(); // El otro evento debe seguir ahí
    expect(window.confirm).toHaveBeenCalledWith('¿Estás seguro de que deseas eliminar este evento?');
  });
});
