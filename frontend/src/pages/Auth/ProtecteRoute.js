import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContex';
import { Spinner, Container } from 'react-bootstrap';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Mostrar spinner mientras se verifica la autenticación
  if (isLoading) {
    return (
      <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <Spinner animation="border" variant="primary" size="lg" />
          <p className="mt-3 text-muted">Verificando autenticación...</p>
        </div>
      </Container>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si se requiere un rol específico y el usuario no lo tiene
  if (requiredRole && user && user.role !== requiredRole) {
    return (
      <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <i className="bi bi-shield-exclamation text-warning" style={{ fontSize: '4rem' }}></i>
          <h3 className="mt-3">Acceso Denegado</h3>
          <p className="text-muted">No tienes permisos para acceder a esta página.</p>
          <button 
            className="btn btn-primary"
            onClick={() => window.history.back()}
          >
            Volver
          </button>
        </div>
      </Container>
    );
  }

  // Si todo está bien, mostrar el componente hijo
  return children;
};

export default ProtectedRoute;