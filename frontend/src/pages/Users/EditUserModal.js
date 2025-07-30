import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import UserApi from '../../api/UserApi';
import UserForm from './UserForm';

const EditUserModal = ({ show, onHide, onUserUpdated, user }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    pasword: '',
    role: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        email: user.email || '',
        pasword: '',
        role: user.role || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      // Si no se ingresó una nueva contraseña, no la enviamos
      const dataToSend = { ...formData };
      if (!dataToSend.pasword.trim()) {
        delete dataToSend.pasword;
      }

      await UserApi.updateUser(user.id, dataToSend);
      onUserUpdated();
    } catch (error) {
      setError('Error al actualizar el usuario. Por favor, intenta nuevamente.');
      console.error('Error updating user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Editar Usuario</Modal.Title>
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
            isEditing={true}
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
              {loading ? 'Actualizando...' : 'Actualizar Usuario'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditUserModal;