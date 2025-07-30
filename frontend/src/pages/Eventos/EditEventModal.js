import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Spinner } from 'react-bootstrap';
import EventApi from '../../api/EvenApi'; // Asegúrate de que esta ruta sea correcta
import EventForm from './EventForm'; // Importa el formulario del evento

const EditEventModal = ({ show, onHide, onEventUpdated, event }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    lugar: '',
    capacidad: 0,
    estado: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carga los datos del evento seleccionado en el formulario cuando el modal se abre
  useEffect(() => {
    if (event) {
      setFormData({
        titulo: event.titulo || '',
        descripcion: event.descripcion || '',
        fecha_inicio: event.fecha_inicio || '',
        fecha_fin: event.fecha_fin || '',
        lugar: event.lugar || '',
        capacidad: event.capacidad || 0,
        estado: event.estado || ''
      });
    }
  }, [event]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!event?.id) {
      setError('ID del evento no disponible para actualizar.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepara los datos para enviar, excluyendo campos que no se deben actualizar
      // o que no han cambiado (aunque la API debería manejar esto).
      const dataToSend = {
        ...formData,
        // Convertir fechas a formato ISO si es necesario, aunque el input datetime-local ya lo hace
        fecha_inicio: new Date(formData.fecha_inicio).toISOString(),
        fecha_fin: new Date(formData.fecha_fin).toISOString(),
      };

      await EventApi.updateEvent(event.id, dataToSend);
      onEventUpdated(); // Llama a la función para recargar la lista de eventos
    } catch (err) {
      console.error('Error al actualizar el evento:', err);
      // Manejo de errores más específico si la API devuelve detalles
      setError(err.response?.data?.detail || 'Error al actualizar el evento. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null); // Limpiar errores al cerrar
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Editar Evento</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}
        <Form onSubmit={handleSubmit}>
          <EventForm
            formData={formData}
            onChange={handleChange}
            isEditing={true} // Indica que estamos en modo edición para mostrar el campo de estado
          />
          <div className="d-flex justify-content-end mt-4">
            <Button
              variant="secondary"
              onClick={handleClose}
              className="me-2"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              variant="warning"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Actualizando...
                </>
              ) : (
                'Actualizar Evento'
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditEventModal;
