import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import UserList from './pages/Users/UserList';
import SidebarNavbar from './components/sidebarNavbar';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard';
import Eventos from './pages/Eventos/EventList';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Perfil from './pages/Perfil/Perfil';
import { AuthProvider, useAuth } from './pages/Auth/AuthContex';
import { Spinner } from 'react-bootstrap';
import React from 'react';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <Spinner animation="border" variant="primary" size="lg" />
          <p className="mt-3 text-muted">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Redirigir todas las demás rutas al login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="App">
      <SidebarNavbar>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/usuarios" element={<UserList />} />
          
          {/* Redirigir login/register al dashboard si ya está autenticado */}
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="/register" element={<Navigate to="/dashboard" replace />} />
          
          {/* Ruta por defecto */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SidebarNavbar>
    </div>
  );
};

// Componente 404
const NotFound = () => {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
      <div className="text-center">
        <h1 className="display-1 fw-bold text-primary">404</h1>
        <h3>Página no encontrada</h3>
        <p className="text-muted">La página que buscas no existe.</p>
        <Link to="/dashboard" className="btn btn-primary">
          Ir al Dashboard
        </Link>
      </div>
    </div>
  );
};

export default App;
