import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import UserApi from '../../api/UserApi';
import UserForm from './UserForm';

const CreateUserModal = ({ show, onHide, onUserCreated }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    role: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await UserApi.createUser(formData);
      // Limpiar formulario
      setFormData({
        nombre: '',
        email: '',
        password: '',
        role: ''
      });
      onUserCreated(); // Callback para notificar al padre
    } catch (error) {
      setError('Error al crear el usuario. Por favor, intenta nuevamente.');
      console.error('Error creating user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Limpiar formulario y errores al cerrar
    setFormData({
      nombre: '',
      email: '',
      password: '',
      role: ''
    });
    setError(null);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Crear Nuevo Usuario</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}
        <Form onSubmit={handleSubmit}>
          <UserForm 
            formData={formData} 
            onChange={handleChange}
            isEditing={false}
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
              variant="success" 
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Usuario'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CreateUserModal;