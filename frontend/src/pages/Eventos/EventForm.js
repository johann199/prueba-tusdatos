import React from 'react';
import { Form } from 'react-bootstrap';


// Función auxiliar para formatear fechas para los inputs datetime-local
const formatDateTimeLocal = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const EventForm = ({ formData, onChange, isEditing = false }) => {
  // Convertir el objeto EstadosEvento a un array de opciones para el select
  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label htmlFor="titulo">Título del Evento</Form.Label>
        <Form.Control
          type="text"
          id="titulo"
          name="titulo"
          value={formData.titulo}
          onChange={onChange}
          placeholder="Ej: Conferencia de Tecnología 2024"
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="descripcion">Descripción</Form.Label>
        <Form.Control
          as="textarea"
          id="descripcion"
          name="descripcion"
          value={formData.descripcion}
          onChange={onChange}
          placeholder="Breve descripción del evento"
          rows={3}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="fecha_inicio">Fecha y Hora de Inicio</Form.Label>
        <Form.Control
          type="datetime-local"
          id="fecha_inicio"
          name="fecha_inicio"
          value={formatDateTimeLocal(formData.fecha_inicio)}
          onChange={onChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="fecha_fin">Fecha y Hora de Fin</Form.Label>
        <Form.Control
          type="datetime-local"
          id="fecha_fin"
          name="fecha_fin"
          value={formatDateTimeLocal(formData.fecha_fin)}
          onChange={onChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="lugar">Lugar</Form.Label>
        <Form.Control
          type="text"
          id="lugar"
          name="lugar"
          value={formData.lugar}
          onChange={onChange}
          placeholder="Ej: Centro de Convenciones"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="capacidad">Capacidad Máxima</Form.Label>
        <Form.Control
          type="number"
          id="capacidad"
          name="capacidad"
          value={formData.capacidad}
          onChange={onChange}
          placeholder="Ej: 100"
          min="1"
          required
        />
      </Form.Group>

      {isEditing && ( // Solo mostrar el estado si estamos editando
        <Form.Group className="mb-3">
          <Form.Label htmlFor="estado">Estado del Evento</Form.Label>
          <Form.Control
            as="select"
            id="estado"
            name="estado"
            value={formData.estado}
            onChange={onChange}
            required
          >
            <option value="">Seleccione un Estado</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En curso">En curso</option>
            <option value="Cancelado">Cancelado</option>
            <option value="Finalizado">Finalizado</option>
          </Form.Control>
        </Form.Group>
      )}
    </>
  );
};

export default EventForm;
