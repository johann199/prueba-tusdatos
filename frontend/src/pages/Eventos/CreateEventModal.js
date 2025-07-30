import React, { useState } from 'react';
import { Container, Button, Form, Modal, Alert} from 'react-bootstrap';
import EventApi from '../../api/EvenApi';

const CreateEvent = ({ onClose, onEventCreated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    lugar: '',
    capacidad: '',
    estado: ''
  });

  const [errors, setErrors] = useState({});

  // Estados disponibles para el evento
  const ESTADOS = [
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'ACTIVO', label: 'Activo' },
    { value: 'CANCELADO', label: 'Cancelado' },
    { value: 'FINALIZADO', label: 'Finalizado' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validaciones
    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es obligatorio';
    }

    if (!formData.descripcion.trim()) {
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

    if (formData.capacidad < 1) {
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
    
    try {
      await EventApi.createEvent(formData);
      setFormData({
        titulo: '',
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: '',
        lugar: '',
        capacidad: '',
        estado: ''
      });

      onEventCreated();
      
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal show onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Crear Nuevo Evento</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {errors && (
          <Alert variant="danger" className="mb-3">
            {Object.values(errors).map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </Alert>
          )}
        <Form onSubmit={handleSubmit} className="space-y-6">
          {/* Título */}
          <Container>
            <Form.Label htmlFor="titulo">
              Título del Evento *
            </Form.Label>
            <Form.Control
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.titulo ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: Conferencia de Tecnología 2024"
            />
            {errors.titulo && (
              <p className="text-red-500 text-sm mt-1">{errors.titulo}</p>
            )}
          </Container>

          {/* Descripción */}
          <Container>
            <Form.Label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </Form.Label>
            <Form.Control
              as="textarea"
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              rows={4}
              placeholder="Describe el evento, sus objetivos y lo que los asistentes pueden esperar..."
            />
            {errors.descripcion && (
              <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>
            )}
          </Container>

          {/* Fechas */}
          <Container className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Container>
              <Form.Label htmlFor="fecha_inicio" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Inicio *
              </Form.Label>
              <Form.Control
                type="datetime-local"
                id="fecha_inicio"
                name="fecha_inicio"
                value={formData.fecha_inicio}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.fecha_inicio ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.fecha_inicio && (
                <p className="text-red-500 text-sm mt-1">{errors.fecha_inicio}</p>
              )}
            </Container>

            <Container>
              <Form.Label htmlFor="fecha_fin" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Fin *
              </Form.Label>
              <Form.Control
                type="datetime-local"
                id="fecha_fin"
                name="fecha_fin"
                value={formData.fecha_fin}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.fecha_fin ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.fecha_fin && (
                <p className="text-red-500 text-sm mt-1">{errors.fecha_fin}</p>
              )}
            </Container>
          </Container>

          {/* Lugar */}
          <Container>
            <Form.Label htmlFor="lugar" className="block text-sm font-medium text-gray-700 mb-2">
              Lugar
            </Form.Label>
            <Form.Control
              type="text"
              id="lugar"
              name="lugar"
              value={formData.lugar}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Centro de Convenciones, Aula Virtual, etc."
            />
          </Container>

          {/* Capacidad y Estado */}
          <Container className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Container>
              <Form.Label htmlFor="capacidad" className="block text-sm font-medium text-gray-700 mb-2">
                Capacidad *
              </Form.Label>
              <Form.Control
                type="number"
                id="capacidad"
                name="capacidad"
                value={formData.capacidad}
                onChange={handleInputChange}
                min="1"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.capacidad ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="100"
              />
              {errors.capacidad && (
                <p className="text-red-500 text-sm mt-1">{errors.capacidad}</p>
              )}
            </Container>

            <Container>
              <Form.Label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </Form.Label>
              <Form.Select>
                <option value="">Seleccione un estado</option>
                {ESTADOS.map(estado => (
                  <option key={estado.value} value={estado.value}>
                    {estado.label}
                  </option>
                ))}
              </Form.Select>
            </Container>
          </Container>

          {/* Botones */}
          <Container className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              variant="primary"
            >
              {isLoading ? 'Creando...' : 'Crear Evento'}
            </Button>
          </Container>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CreateEvent;