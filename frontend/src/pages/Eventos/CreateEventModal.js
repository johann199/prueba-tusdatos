import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import EventApi from '../../api/EvenApi';
import EventForm from './EventForm';

const CreateEventModal = ({ onClose, onEventCreated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    lugar: '',
    capacidad: '',
    estado: 'Pendiente' // Estado por defecto
  });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  const handleInputChange = (e) => {
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setGeneralError('');
    
    try {
      const eventData = {
        ...formData,
        capacidad: parseInt(formData.capacidad)
      };
      
      await EventApi.createEvent(eventData);
      
      // Resetear formulario
      setFormData({
        titulo: '',
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: '',
        lugar: '',
        capacidad: '',
        estado: 'Pendiente'
      });

      // Notificar éxito y cerrar modal
      onEventCreated();
      
    } catch (error) {
      console.error('Error creating event:', error);
      setGeneralError(
        error.response?.data?.message || 
        'Error al crear el evento. Por favor, inténtalo de nuevo.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal show onHide={onClose} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Crear Nuevo Evento</Modal.Title>
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
            onChange={handleInputChange}
            errors={errors}
            isEditing={false}
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
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  Creando...
                </>
              ) : (
                'Crear Evento'
              )}
            </Button>
          </div>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CreateEventModal;