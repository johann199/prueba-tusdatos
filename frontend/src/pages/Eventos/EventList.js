import React, { useState, useEffect } from 'react';
import { Container, Button, Table, Card, Badge, ProgressBar } from 'react-bootstrap';
import {
  Person,
  Calendar,
  GeoAlt,
  Plus,
  CalendarX,
  Calendar2Check,
  Calendar2PlusFill,
  PencilSquare,
  FileEarmarkText,
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
    'Pendiente': 'Pendiente',
    'En curso': 'En curso', 
    'Cancelado': 'Cancelado',
    'Finalizado': 'Finalizado'
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await EventApi.fetchEvents();
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

  const getStatusVariant = (estado) => {
    const variants = {
      'Pendiente': 'warning',
      'En curso': 'success', 
      'Cancelado': 'danger',
      'Finalizado': 'secondary'
    };
    return variants[estado] || 'secondary';
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

  const getCapacityPercentage = (registrado, capacidad) => {
    if (!capacidad || capacidad === 0) return 0;
    return Math.min((registrado / capacidad) * 100, 100);
  };

  if (loading) {
    return <div className="text-center p-4">Cargando eventos...</div>;
  }

  return (
    <Container fluid className="p-0">
      <Card className="border-0 shadow-sm">
        <div className='d-flex justify-content-between align-items-center p-4 bg-light border-bottom'>
          <div>
            <h2 className="mb-1">Gestión de Eventos</h2>
            <small className="text-muted">Administra todos los eventos del sistema</small>
          </div>
          <Button 
            variant="primary" 
            onClick={() => setShowCreateModal(true)} 
            className="px-4"
          >
            <Calendar2PlusFill className="me-2" size={20} />
            Crear Evento
          </Button>
        </div>
        
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table striped hover className="mb-0">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Evento</th>
                  <th>Fecha</th>
                  <th>Lugar</th>
                  <th>Capacidad</th>
                  <th>Estado</th>
                  <th>Creador</th>
                  <th width="300">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <Badge bg="secondary">{event.id}</Badge>
                    </td>
                    <td>
                      <div>
                        <div className="fw-medium">{event.titulo}</div>
                        <small className="text-muted">
                          {event.descripcion?.substring(0, 50)}
                          {event.descripcion?.length > 50 ? '...' : ''}
                        </small>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <Calendar size={14} className="text-muted me-2" />
                        <div>
                          <div className="small">{formatDate(event.fecha_inicio)}</div>
                          <small className="text-muted">
                            hasta {formatDate(event.fecha_fin)}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <GeoAlt size={14} className="text-muted me-2" />
                        <span className="small">
                          {event.lugar?.substring(0, 20)}
                          {event.lugar?.length > 20 ? '...' : ''}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center mb-1">
                        <Person size={14} className="text-muted me-2" />
                        <small>{event.registrado || 0}/{event.capacidad || 0}</small>
                      </div>
                      <ProgressBar 
                        now={getCapacityPercentage(event.registrado, event.capacidad)} 
                        size="sm" striped
                        variant={getCapacityPercentage(event.registrado, event.capacidad) > 80 ? 'warning' : 'info'}
                      />
                    </td>
                    <td>
                      <Badge bg={getStatusVariant(event.estado)}>
                        {ESTADOS[event.estado] || event.estado || 'Desconocido'}
                      </Badge>
                    </td>
                    <td>
                      <small>{event.creador?.nombre || event.creador_id || 'N/A'}</small>
                    </td>
                    <td>
                      <div className="d-flex gap-1 flex-wrap">
                        <Button
                          onClick={() => handleRegister(event)}
                          variant="outline-success"
                          size="sm"
                          title="Registrarme"
                        >
                          <Calendar2Check className="me-2" size={16} />
                        </Button>
                        <Button
                          onClick={() => handleViewDetails(event)}
                          variant="outline-info"
                          size="sm"
                          title="Ver detalles"
                        >
                          <FileEarmarkText className="me-2" size={16} />
                        </Button>
                        <Button
                          onClick={() => handleEdit(event)}
                          variant="outline-primary"
                          size="sm"
                          title="Editar"
                        >
                          <PencilSquare className="me-2" size={16} />
                        </Button>
                        <Button
                          onClick={() => handleDelete(event.id)}
                          variant="outline-danger"
                          size="sm"
                          title="Eliminar"
                        >
                           <CalendarX className="me-2" size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          
          {events.length === 0 && (
            <div className="text-center p-5">
              <Calendar size={48} className="text-muted mb-3" />
              <p className="text-muted mb-3">No hay eventos registrados</p>
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                <Plus className="me-2" size={16} />
                Crear primer evento
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

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
        onRegistrationSuccess={handleEventRegistered}
      />
    </Container>
  );
};

export default EventList;