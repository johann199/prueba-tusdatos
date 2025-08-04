import React from "react";
import { useAuth } from "../../pages/Auth/AuthContex";
import { Navigate } from "react-router-dom";
import { Spinner, Col, Row, Container, Card } from "react-bootstrap";
import {
  PersonVcardFill,
  PersonCircle,
  EnvelopeFill,
  PersonRolodex,
} from 'react-bootstrap-icons';
import "bootstrap/dist/css/bootstrap.min.css";

const Perfil = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
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
    return <Navigate to="/login" replace />;
  }
  return (
    <Card className="mt-5">
        <Card.Header>
          <h1><PersonVcardFill className="me-2" size={30} />
          <span className="fw-bold">Perfil de Usuario</span></h1>
        </Card.Header>
        <Card.Body>
            <Container className="mt-5"> 
            <Row>
            </Row>
                <Row>
                    <Col xs={6}>
                    <p>
                      <strong><PersonCircle className="me-2" size={24} />Nombre:</strong> 
                      {user.nombre}
                    </p>
                    </Col>
                    <Col xs={6}>
                    <p>
                      <strong><EnvelopeFill className="me-2" size={24} />Email:</strong> 
                      {user.email}
                    </p>
                    </Col>
                </Row>
                <Row>
                    <Col xs={6}>
                    <p><strong>
                      <PersonRolodex className="me-2" size={24} />Rol:
                      </strong> {user.role}
                    </p>
                    </Col>
                    <Col>
                    </Col>
                </Row>
            </Container>
        </Card.Body>
    </Card>
  );
};

export default Perfil;
