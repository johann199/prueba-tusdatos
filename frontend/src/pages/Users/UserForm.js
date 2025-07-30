// src/components/UserForm.js
import React from 'react';
import Form from 'react-bootstrap/Form';

const UserForm = ({ formData, onChange }) => {
  return (
    <>
      <Form.Group controlId="formEmail" className="mb-3">
        <Form.Label>Correo</Form.Label>
        <Form.Control
          type="email"
          name="email"
          value={formData.email}
          onChange={onChange}
          placeholder="Correo"
        />
      </Form.Group>

      <Form.Group controlId="formPassword" className="mb-3">
        <Form.Label>Contraseña</Form.Label>
        <Form.Control
          type="password"
          name="pasword"
          value={formData.pasword}
          onChange={onChange}
          placeholder="Contraseña"
        />
      </Form.Group>

      <Form.Group controlId="formRole" className="mb-3">
        <Form.Label>Rol</Form.Label>
        <Form.Control
          as="select"
          name="role"
          value={formData.role}
          onChange={onChange}
        >
          <option value="">Seleccione un rol</option>
          <option value="Admin">Administrador</option>
          <option value="Asistente">Asistente</option>
          <option value="Organizador">Organizador</option>
        </Form.Control>
      </Form.Group>

      <Form.Group controlId="formNombre" className="mb-3">
        <Form.Label>Nombre</Form.Label>
        <Form.Control
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={onChange}
          placeholder="Nombre completo"
        />
      </Form.Group>
    </>
  );
};

export default UserForm;
