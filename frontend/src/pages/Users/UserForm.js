import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const UserForm = ({ formData, onChange, errors = {}, isEditing = false }) => {
  return (
    <>
      {/* Nombre y Email - Dos columnas */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              Nombre Completo <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={formData.nombre || ''}
              onChange={onChange}
              placeholder="Ingrese el nombre completo"
              isInvalid={!!errors.nombre}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.nombre}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              Correo Electrónico <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={onChange}
              placeholder="usuario@ejemplo.com"
              isInvalid={!!errors.email}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* Contraseña y Rol - Dos columnas */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              Contraseña <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password || ''}
              onChange={onChange}
              placeholder="Mínimo 6 caracteres"
              isInvalid={!!errors.password}
              required
              minLength={6}
            />
            <Form.Control.Feedback type="invalid">
              {errors.password}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              La contraseña debe tener al menos 6 caracteres
            </Form.Text>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              Rol <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              name="role"
              value={formData.role || ''}
              onChange={onChange}
              isInvalid={!!errors.role}
              required
            >
              <option value="">Seleccione un rol</option>
              <option value="Admin">Administrador</option>
              <option value="Organizador">Organizador</option>
              <option value="Asistente">Asistente</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.role}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* Estado del usuario - Solo en edición */}
      {isEditing && (
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Estado del Usuario</Form.Label>
              <Form.Select
                name="is_active"
                value={formData.is_active}
                onChange={onChange}
              >
                <option value={true}>Activo</option>
                <option value={false}>Inactivo</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <div className="p-2 bg-light rounded border">
              <small className="text-muted">
                Los usuarios inactivos no podrán iniciar sesión
              </small>
            </div>
          </Col>
        </Row>
      )}

      {/* Información adicional para nuevos usuarios */}
      {!isEditing && (
        <Row className="mb-3">
          <Col>
            <div className="alert alert-info">
              <small>
                <strong>Nota:</strong> Los campos marcados con <span className="text-danger">*</span> son obligatorios. 
                El usuario recibirá estas credenciales para iniciar sesión.
              </small>
            </div>
          </Col>
        </Row>
      )}
    </>
  );
};

export default UserForm;