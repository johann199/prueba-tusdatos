import React, { useState } from 'react';
import { Nav, Button, Offcanvas } from 'react-bootstrap';
import {
  House,
  Person,
  Calendar,
  Gear,
  BoxArrowRight,
  List,
  PersonCircle
} from 'react-bootstrap-icons';
import './css/SidebarNavbar.css';
import { Link } from 'react-router-dom';
import { useAuth } from '../pages/Auth/AuthContex'; // Importa useAuth para el logout

// Asegúrate de que SidebarNavbar reciba 'children' como prop
const SidebarNavbar = ({ children }) => { // <--- Añade 'children' aquí
  const [show, setShow] = useState(false);
  const { logout, currentUser } = useAuth(); // Obtén logout y currentUser del contexto

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const menuItems = [
    { href: "/dashboard", icon: <House />, label: "Dashboard" },
    { href: "/eventos", icon: <Calendar />, label: "Eventos" },
    { href: "/perfil", icon: <Person />, label: "Mi Perfil" },
    // Nota: La ruta /configuracion está protegida por rol en App.js
    // Si un usuario sin rol ADMIN hace clic aquí, ProtectedRoute lo manejará.
    { href: "/admin", icon: <Gear />, label: "Configuración" }, // Cambiado a /admin para coincidir con App.js
    { href: "/usuarios", icon: <PersonCircle />, label: "Usuarios" }
  ];

  const SidebarContent = () => (
    <>
      {/* Header del Sidebar */}
      <div className="sidebar-header">
        <h5 className="mb-0">Eventos</h5>
        {currentUser && (
          <small className="text-muted">
            Bienvenido, {currentUser.nombre || currentUser.email || 'Usuario'}
          </small>
        )}
      </div>

      {/* Menu Items */}
      <Nav className="flex-column sidebar-nav">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.href}
            className="sidebar-item d-flex align-items-center nav-link"
            onClick={handleClose} // Cierra el offcanvas al hacer clic en un enlace
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
          onClick={logout} // Usa la función logout del contexto
        >
          <BoxArrowRight className="me-2" />
          Cerrar Sesión
        </Button>
      </div>
    </>
  );

  return (
    // Contenedor principal para el sidebar y el contenido
    <div className="d-flex w-100 min-vh-100"> {/* Añade w-100 y min-vh-100 para ocupar el espacio */}
      {/* Botón para mostrar sidebar en móviles */}
      <Button
        variant="outline-primary"
        className="d-md-none sidebar-toggle position-fixed top-0 start-0 m-3 z-index-1000" // Posiciona el botón
        onClick={handleShow}
      >
        <List />
      </Button>

      {/* Sidebar para desktop */}
      <div className="sidebar d-none d-md-flex flex-column"> {/* Añade flex-column */}
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
      <div className="main-content-area flex-grow-1 p-3 p-md-4"> {/* Añade padding y flex-grow-1 */}
        {children} {/* <--- ¡Esto es lo crucial! Renderiza los hijos aquí */}
      </div>
    </div>
  );
};

export default SidebarNavbar;