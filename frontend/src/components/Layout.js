import React from 'react';
import { Container } from 'react-bootstrap';
import SidebarNavbar from './SidebarNavbar';

const Layout = ({ children, currentUser, onLogout }) => {
  return (
    <div className="d-flex">
      <SidebarNavbar 
        currentUser={currentUser} 
        onLogout={onLogout}
      />
      
      <div className="main-content flex-fill">
        <Container fluid>
          {children}
        </Container>
      </div>
    </div>
  );
};

export default Layout;