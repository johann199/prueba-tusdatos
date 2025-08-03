import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Spinner } from 'react-bootstrap';
import EventApi from '../../api/EvenApi';
import EventForm from './EventForm'; // Usa el EventForm actualizado

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
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

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
      // Limpiar errores cuando se carga un nuevo evento
      setErrors({});
      setGeneralError('');
    }
  }, [event]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || '' : value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Limpiar error general
    if (generalError) {
      setGeneralError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validaciones
    if (!formData.titulo?.trim()) {
      newErrors.titulo = 'El título es obligatorio';
    }

    if (!formData.descripcion?.trim()) {
      newErrors.descripcion = 'La descripción es obligatoria';
    }

    if (!formData.fecha_inicio) {
      newErrors.fecha_inicio = 'La fecha de inicio es obligatoria';
    }

    if (!formData.fecha_fin) {
      newErrors.fecha_fin = 'La fecha de fin es obligatoria';
    }

    if (formData.fecha_inicio && formData.fecha_fin) {
      if (new Date(formData.fecha_inicio) >= new Date(formData.fecha_fin)) {
        newErrors.fecha_fin = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }

    if (!formData.capacidad || formData.capacidad < 1) {
      newErrors.capacidad = 'La capacidad debe ser mayor a 0';
    }

    if (!formData.estado) {
      newErrors.estado = 'Debe seleccionar un estado';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!event?.id) {
      setGeneralError('ID del evento no disponible para actualizar.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setGeneralError('');

    try {
      // Prepara los datos para enviar
      const dataToSend = {
        ...formData,
        capacidad: parseInt(formData.capacidad),
        // Solo convertir fechas si no están ya en formato ISO
        fecha_inicio: formData.fecha_inicio.includes('T') ? 
          new Date(formData.fecha_inicio).toISOString() : 
          formData.fecha_inicio,
        fecha_fin: formData.fecha_fin.includes('T') ? 
          new Date(formData.fecha_fin).toISOString() : 
          formData.fecha_fin,
      };

      await EventApi.updateEvent(event.id, dataToSend);
      onEventUpdated(); // Llama a la función para recargar la lista de eventos
    } catch (err) {
      console.error('Error al actualizar el evento:', err);
      
      // Manejo de errores más específico
      if (err.response?.data?.detail) {
        // Si es un array de errores de validación
        if (Array.isArray(err.response.data.detail)) {
          const backendErrors = {};
          err.response.data.detail.forEach(error => {
            if (error.loc && error.loc.length > 1) {
              const field = error.loc[error.loc.length - 1];
              backendErrors[field] = error.msg;
            }
          });
          setErrors(prev => ({ ...prev, ...backendErrors }));
        } else {
          setGeneralError(err.response.data.detail);
        }
      } else {
        setGeneralError('Error al actualizar el evento. Por favor, intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setErrors({}); // Limpiar errores al cerrar
    setGeneralError('');
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Editar Evento</Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {generalError && (
            <Alert variant="danger" className="mb-3">
              {generalError}
            </Alert>
          )}
          
          <EventForm
            formData={formData}
            onChange={handleChange}
            errors={errors}
            isEditing={true} // Indica que estamos en modo edición
          />
        </Modal.Body>

        <Modal.Footer className="d-flex justify-content-between">
          <div>
            <small className="text-muted">
              * Campos obligatorios
            </small>
          </div>
          <div className="d-flex gap-2">
            <Button
              variant="secondary"
              onClick={handleClose}
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
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  Actualizando...
                </>
              ) : (
                'Actualizar Evento'
              )}
            </Button>
          </div>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditEventModal;