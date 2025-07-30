import React, { useState, useEffect } from 'react';
import { Container, Button, Table } from 'react-bootstrap';
import {
  Person,
  Calendar,
} from 'react-bootstrap-icons';
import CreateEventModal from './CreateEventModal';
import EditEventModal from './EditEventModal';
import EventApi from '../../api/EvenApi';
import EventDetailsModal from './EventDetails';
import RegisterEventModal from './RegisterEventModal';
import 'bootstrap/dist/css/bootstrap.min.css';

const EventList = () => {

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Estados posibles del evento
  const ESTADOS = {
    PENDIENTE: 'Pendiente',
    ACTIVO: 'Activo',
    CANCELADO: 'Cancelado',
    FINALIZADO: 'Finalizado'
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await EventApi.fetchEvents();
      // Es crucial verificar la estructura de response.data aquí.
      // Por ejemplo, puedes hacer un console.log(response.data) para verla.
      setEvents(response.data);
    } catch (error) {
      console.error('Error loading events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (estado) => {
    // Normaliza el estado a mayúsculas para que coincida con las claves de ESTADOS
    const normalizedEstado = (estado || '').toUpperCase();
    const colors = {
      PENDIENTE: 'bg-yellow-100 text-yellow-800',
      ACTIVO: 'bg-green-100 text-green-800',
      CANCELADO: 'bg-red-100 text-red-800',
      FINALIZADO: 'bg-gray-100 text-gray-800'
    };
    return colors[normalizedEstado] || 'bg-gray-100 text-gray-800'; // Color por defecto
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setShowEditModal(true);
  };
  const handleCloseEdit = () => {
    setShowEditModal(false);
    setSelectedEvent(null);
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este evento?')) {
      try {
        await EventApi.deleteEvent(eventId);
        setEvents(events.filter(event => event.id !== eventId));
      } catch (error) {
        console.error('Error al eliminar el evento:', error);
      }
    }
  };

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setShowDetails(true);
  };

  const handleRegister = (event) => {
    setSelectedEvent(event);
    setShowRegisterModal(true);
  };

  const handleCloseRegister = () => {
    setShowRegisterModal(false);
    setSelectedEvent(null);
  };

  const handleEventCreated = async (newEvent) => {
    await loadEvents();
    setShowCreateModal(false);
  };

  const handleEventUpdated = async (updatedEvent) => {
    await loadEvents();
    setShowEditModal(false);
    setSelectedEvent(null);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedEvent(null);
  };

  const handleEventRegistered = async () => {
    await loadEvents(); 
    handleCloseRegister();
  };

  if (loading) {
    return (
      <Container className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </Container>
    );
  }

  return (
    <Container className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Eventos</h1>
          <p className="text-gray-600 mt-1">Administra todos los eventos del sistema</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          Crear Evento
        </Button>
      </div>
      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-full divide-y divide-gray-200"> {/* Corregido Containeride-y a divide-y */}
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Evento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha y Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lugar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Creador
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200"> {/* Corregido Containeride-y a divide-y */}
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {event.titulo}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {event.descripcion}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} className="text-gray-400" />
                      <div>
                        <div>{formatDate(event.fecha_inicio)}</div>
                        <div className="text-xs text-gray-500">
                          hasta {formatDate(event.fecha_fin)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-1">
                      <span className="max-w-xs truncate">{event.lugar}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-1">
                      <Person size={16} className="text-gray-400" />
                      <span>{event.registrado}/{event.capacidad}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min((event.registrado / event.capacidad) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(event.estado)}`}>
                      {ESTADOS[(event.estado || '').toUpperCase()] || event.estado || 'Desconocido'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {event.creador?.nombre || event.creador_id || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Button
                        onClick={() => handleRegister(event)}
                        variant="success"
                        title="Registrarme en el evento"
                      >
                        Registrarme
                      </Button>
                      <Button
                        onClick={() => handleViewDetails(event)}
                        variant="secondary"
                        title="Ver detalles"
                      >
                        Detalles
                      </Button>
                      <Button
                        onClick={() => handleEdit(event)}
                        variant="info"
                        title="Editar"
                      >
                        Editar
                      </Button>
                      <Button
                        onClick={() => handleDelete(event.id)}
                        variant="danger"
                        title="Eliminar"
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>

      {/* Modales */}
      {showCreateModal && (
        <CreateEventModal
          onClose={() => setShowCreateModal(false)}
          onEventCreated={handleEventCreated}
        />
      )}

      <EditEventModal
        show={showEditModal}
        onHide={handleCloseEdit}
        onEventUpdated={handleEventUpdated}
        event={selectedEvent}
      />

      <EventDetailsModal
        show={showDetails}
        onHide={handleCloseDetails}
        event={selectedEvent}
      />
      
      <RegisterEventModal
        show={showRegisterModal}
        onHide={handleCloseRegister}
        event={selectedEvent}
        onRegistrationSuccess={handleEventRegistered} // Pasa la función de éxito
      />
    </Container>
  );
};

export default EventList;
