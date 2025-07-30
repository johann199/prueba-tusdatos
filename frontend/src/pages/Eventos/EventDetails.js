import React, { useState, useEffect } from 'react';
import { Modal, Button, Container, Spinner, Alert } from 'react-bootstrap'; 
import { Person, Calendar } from 'react-bootstrap-icons';
import EventApi from '../../api/EvenApi'; 


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

// Helper para obtener el nombre del estado (puedes reutilizar el de EventList si lo exportas)
const getEstadoNombre = (estado) => {
  const ESTADOS = {
    PENDIENTE: 'Pendiente',
    ACTIVO: 'Activo',
    CANCELADO: 'Cancelado',
    FINALIZADO: 'Finalizado'
  };
  return ESTADOS[(estado || '').toUpperCase()] || estado || 'Desconocido';
};

const getStatusColor = (estado) => {
  const normalizedEstado = (estado || '').toUpperCase();
  const colors = {
    PENDIENTE: 'bg-warning text-dark',
    ACTIVO: 'bg-success text-white',
    CANCELADO: 'bg-danger text-white',
    FINALIZADO: 'bg-secondary text-white'
  };
  return colors[normalizedEstado] || 'bg-secondary text-white';
};

const EventDetailsModal = ({ show, onHide, event }) => {
  const [detailedEvent, setDetailedEvent] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [error, setError] = useState(null);

  
  useEffect(() => {
    if (show && event?.id) {
      const fetchDetailedEvent = async () => {
        setLoadingDetails(true);
        setError(null);
        try {
          const response = await EventApi.getEvent(event.id); 
          setDetailedEvent(response.data);
        } catch (err) {
          console.error('Error fetching detailed event:', err);
          setError('No se pudieron cargar los detalles del evento.');
        } finally {
          setLoadingDetails(false);
        }
      };
      fetchDetailedEvent();
    } else if (!show) {
      setDetailedEvent(null);
      setLoadingDetails(true);
      setError(null);
    }
  }, [show, event?.id]); 

  
  if (!show) return null; 

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Detalles del Evento: {detailedEvent?.titulo || 'Cargando...'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loadingDetails ? (
          <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '150px' }}>
            <Spinner animation="border" variant="primary" />
            <p className="ms-3">Cargando detalles del evento...</p>
          </Container>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : !detailedEvent ? (
          <Alert variant="info">No se encontraron detalles para este evento.</Alert>
        ) : (
          <Container className="p-0">
            <h4 className="mb-3 text-primary">{detailedEvent.titulo}</h4>
            <p className="text-muted mb-4">{detailedEvent.descripcion}</p>

            <div className="row mb-3">
              <div className="col-md-6">
                <p className="fw-bold mb-1">Fecha de Inicio:</p>
                <p className="d-flex align-items-center gap-2">
                  <Calendar size={18} className="text-secondary" />
                  {formatDate(detailedEvent.fecha_inicio)}
                </p>
              </div>
              <div className="col-md-6">
                <p className="fw-bold mb-1">Fecha de Fin:</p>
                <p className="d-flex align-items-center gap-2">
                  <Calendar size={18} className="text-secondary" />
                  {formatDate(detailedEvent.fecha_fin)}
                </p>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <p className="fw-bold mb-1">Lugar:</p>
                <p>{detailedEvent.lugar || 'No especificado'}</p>
              </div>
              <div className="col-md-6">
                <p className="fw-bold mb-1">Capacidad:</p>
                <p className="d-flex align-items-center gap-2">
                  <Person size={18} className="text-secondary" />
                  {detailedEvent.registrado} / {detailedEvent.capacidad}
                </p>
                <div className="progress" style={{ height: '8px' }}>
                  <div
                    className="progress-bar bg-info"
                    role="progressbar"
                    style={{ width: `${Math.min((detailedEvent.registrado / detailedEvent.capacidad) * 100, 100)}%` }}
                    aria-valuenow={detailedEvent.registrado}
                    aria-valuemin="0"
                    aria-valuemax={detailedEvent.capacidad}
                  ></div>
                </div>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <p className="fw-bold mb-1">Estado:</p>
                <p>
                  <span className={`badge ${getStatusColor(detailedEvent.estado)}`}>
                    {getEstadoNombre(detailedEvent.estado)}
                  </span>
                </p>
              </div>
              <div className="col-md-6">
                <p className="fw-bold mb-1">Creador:</p>
                <p>{detailedEvent.creador?.nombre || detailedEvent.creador_id || 'N/A'}</p>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <p className="fw-bold mb-1">Creado el:</p>
                <p>{formatDate(detailedEvent.creado)}</p>
              </div>
              <div className="col-md-6">
                <p className="fw-bold mb-1">Última Modificación:</p>
                <p>{detailedEvent.modificado ? formatDate(detailedEvent.modificado) : 'N/A'}</p>
              </div>
            </div>

            {/* Sesiones del Evento */}
            {detailedEvent.sesiones && detailedEvent.sesiones.length > 0 && (
              <div className="mt-4">
                <h5 className="text-primary">Sesiones del Evento:</h5>
                <ul className="list-group">
                  {detailedEvent.sesiones.map(session => (
                    <li key={session.id} className="list-group-item d-flex flex-column">
                      <strong>{session.titulo}</strong>
                      <small className="text-muted">
                        ({formatDate(session.fecha_inicio)} - {formatDate(session.fecha_fin)})
                      </small>
                      <span>Orador: {session.nombre_orador}</span>
                      {session.descripcion && <small className="text-muted fst-italic">{session.descripcion}</small>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Container>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EventDetailsModal;
