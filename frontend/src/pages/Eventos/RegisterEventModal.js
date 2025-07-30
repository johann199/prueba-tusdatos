import React, { useState } from 'react';
import { Modal, Button, Spinner, Alert } from 'react-bootstrap';
import EventApi from '../../api/EvenApi';
import { useAuth } from '../../pages/Auth/AuthContex'; 

const RegisterEventModal = ({ show, onHide, event, onRegistrationSuccess }) => {
  const { isAuthenticated } = useAuth(); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!event) return null;

  const handleRegisterClick = async () => {
    if (!isAuthenticated) {
      setError('Debes iniciar sesión para registrarte en un evento.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await EventApi.registerEventUser(event.id); 
      setSuccess(true);
      onRegistrationSuccess(); 
      setTimeout(() => onHide(), 1500); 

    } catch (err) {
      console.error('Error al registrarse en el evento:', err);
      const errorMessage = err.response?.data?.detail || 'Error al registrarse en el evento. Por favor, intenta nuevamente.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Registrarse en "{event.titulo}"</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading && (
          <div className="d-flex justify-content-center align-items-center mb-3">
            <Spinner animation="border" variant="primary" className="me-2" />
            <span>Registrando...</span>
          </div>
        )}
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">¡Registro exitoso!</Alert>}

        {!loading && !success && (
          <>
            <p>¿Estás seguro de que deseas registrarte en el evento **"{event.titulo}"**?</p>
            <p className="text-muted">
              Este evento se realizará en **{event.lugar}** del **{new Date(event.fecha_inicio).toLocaleDateString()}** al **{new Date(event.fecha_fin).toLocaleDateString()}**.
            </p>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleRegisterClick} disabled={loading || success}>
          {loading ? 'Registrando...' : 'Confirmar Registro'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RegisterEventModal;
