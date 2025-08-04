import React, { useState } from 'react';
import { Nav, Button, Offcanvas } from 'react-bootstrap';
import {
  House,
  Person,
  Calendar,
  Gear,
  PersonWalking,
  List,
  PersonCircle
} from 'react-bootstrap-icons';
import './css/SidebarNavbar.css';
import { Link } from 'react-router-dom';
import { useAuth } from '../pages/Auth/AuthContex';

const SidebarNavbar = ({ children }) => {
  const [show, setShow] = useState(false);
  const { logout, user } = useAuth();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const menuItems = [
    { href: "/dashboard", icon: <House />, label: "Dashboard" },
    { href: "/eventos", icon: <Calendar />, label: "Eventos" },
    { href: "/perfil", icon: <Person />, label: "Mi Perfil" },
    { href: "/admin", icon: <Gear />, label: "Configuración" },
    { href: "/usuarios", icon: <PersonCircle />, label: "Usuarios" }
  ];

  const SidebarContent = () => (
    <>
      {/* Información del Usuario */}
      <div style={{ 
        borderBottom: '1px solid #dee2e6', 
        paddingBottom: '1rem', 
        marginBottom: '1rem',
        padding: '1rem'
      }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <PersonCircle 
              size={40}
              style={{ color: '#6c757d', marginRight: '0.75rem' }}
            />
            <div>
              <div style={{ fontWeight: 'bold', color: '#212529', fontSize: '0.95rem' }}>
                {user.nombre || user.name || 'Usuario'}
              </div>
              <small style={{ color: '#6c757d', fontSize: '0.8rem' }}>
                {user.email || 'Sin email'}
              </small>
            </div>
          </div>
        ) : (
          <div style={{ color: '#dc3545', fontSize: '0.9rem' }}>
            <PersonCircle size={40} style={{ color: '#6c757d', marginRight: '0.75rem' }} />
            <span>Usuario no autenticado</span>
          </div>
        )}
      </div>

      {/* Header del Sidebar */}
      <div className="sidebar-header">
        <h5 className="mb-0">Eventos</h5>
        <small className="text-muted">
          Sistema de gestión
        </small>
      </div>

      {/* Menu Items */}
      <Nav className="flex-column sidebar-nav">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.href}
            className="sidebar-item d-flex align-items-center nav-link"
            onClick={handleClose}
          >
            <span className="sidebar-icon me-3">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </Nav>

      {/* Footer del Sidebar */}
      <div className="sidebar-footer mt-auto">
        <Button
          variant="outline-danger"
          size="sm"
          className="w-100 d-flex align-items-center justify-content-center"
          onClick={logout}
        >
          <PersonWalking size={20} className="me-2" />
          Cerrar Sesión
        </Button>
      </div>
    </>
  );

  return (
    <div className="d-flex w-100 min-vh-100">
      {/* Botón para mostrar sidebar en móviles */}
      <Button
        variant="outline-primary"
        className="d-md-none sidebar-toggle position-fixed top-0 start-0 m-3 z-index-1000"
        onClick={handleShow}
      >
        <List />
      </Button>

      {/* Sidebar para desktop */}
      <div className="sidebar d-none d-md-flex flex-column">
        <SidebarContent />
      </div>

      {/* Offcanvas para móviles */}
      <Offcanvas show={show} onHide={handleClose} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menú</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="d-flex flex-column">
          <SidebarContent />
        </Offcanvas.Body>
      </Offcanvas>

      {/* Área principal de contenido donde se renderizarán las rutas */}
      <div className="main-content-area flex-grow-1 p-3 p-md-4">
        {children}
      </div>
    </div>
  );
};

export default SidebarNavbar;