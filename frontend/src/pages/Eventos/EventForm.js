import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';

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

const EventForm = ({ formData, onChange, errors = {}, isEditing = false }) => {
  return (
    <>
      {/* Título del Evento - Fila completa */}
      <Row className="mb-3">
        <Col>
          <Form.Group>
            <Form.Label htmlFor="titulo">
              Título del Evento <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo || ''}
              onChange={onChange}
              placeholder="Ej: Conferencia de Tecnología 2024"
              isInvalid={!!errors.titulo}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.titulo}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* Descripción - Fila completa */}
      <Row className="mb-3">
        <Col>
          <Form.Group>
            <Form.Label htmlFor="descripcion">
              Descripción <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              id="descripcion"
              name="descripcion"
              value={formData.descripcion || ''}
              onChange={onChange}
              placeholder="Describe el evento, sus objetivos y lo que los asistentes pueden esperar..."
              rows={4}
              isInvalid={!!errors.descripcion}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.descripcion}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* Fechas - Dos columnas */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label htmlFor="fecha_inicio">
              Fecha y Hora de Inicio <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="datetime-local"
              id="fecha_inicio"
              name="fecha_inicio"
              value={formatDateTimeLocal(formData.fecha_inicio)}
              onChange={onChange}
              isInvalid={!!errors.fecha_inicio}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.fecha_inicio}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label htmlFor="fecha_fin">
              Fecha y Hora de Fin <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="datetime-local"
              id="fecha_fin"
              name="fecha_fin"
              value={formatDateTimeLocal(formData.fecha_fin)}
              onChange={onChange}
              isInvalid={!!errors.fecha_fin}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.fecha_fin}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* Lugar - Fila completa */}
      <Row className="mb-3">
        <Col>
          <Form.Group>
            <Form.Label htmlFor="lugar">
              Lugar del Evento
            </Form.Label>
            <Form.Control
              type="text"
              id="lugar"
              name="lugar"
              value={formData.lugar || ''}
              onChange={onChange}
              placeholder="Ej: Centro de Convenciones, Aula Virtual, Auditorio Principal"
              isInvalid={!!errors.lugar}
            />
            <Form.Control.Feedback type="invalid">
              {errors.lugar}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* Capacidad y Estado - Dos columnas */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label htmlFor="capacidad">
              Capacidad Máxima <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="number"
              id="capacidad"
              name="capacidad"
              value={formData.capacidad || ''}
              onChange={onChange}
              placeholder="Ej: 100"
              min="1"
              isInvalid={!!errors.capacidad}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.capacidad}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Número máximo de asistentes permitidos
            </Form.Text>
          </Form.Group>
        </Col>
        
        {isEditing && (
          <Col md={6}>
            <Form.Group>
              <Form.Label htmlFor="estado">
                Estado del Evento <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                id="estado"
                name="estado"
                value={formData.estado || ''}
                onChange={onChange}
                isInvalid={!!errors.estado}
                required
              >
                <option value="">Seleccione un estado</option>
                <option value="Pendiente">Pendiente</option>
                <option value="En curso">En curso</option>
                <option value="Cancelado">Cancelado</option>
                <option value="Finalizado">Finalizado</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.estado}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        )}
        
        {/* Si no está editando, mostrar información adicional */}
        {!isEditing && (
          <Col md={6}>
            <Form.Group>
              <Form.Label className="text-muted">
                Estado Inicial
              </Form.Label>
              <div className="p-2 bg-light rounded border">
                <small className="text-muted">
                  El evento se creará con estado <strong>"Pendiente"</strong> por defecto
                </small>
              </div>
            </Form.Group>
          </Col>
        )}
      </Row>

      {/* Información adicional para nuevos eventos */}
      {!isEditing && (
        <Row className="mb-3">
          <Col>
            <div className="alert alert-info">
              <small>
                <strong>Nota:</strong> Los campos marcados con <span className="text-danger">*</span> son obligatorios. 
                Una vez creado el evento, podrás modificar todos los campos incluyendo el estado.
              </small>
            </div>
          </Col>
        </Row>
      )}
    </>
  );
};

export default EventForm;