import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../Auth/AuthContex';
import { useNavigate, Link } from 'react-router-dom';
import AuthApi from '../../api/AuthApi';
const Register = () => {
  const navigate = useNavigate();
  const { isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    correo: '',
    nombre: '',
    pasword: '',
    confirmPassword: '',
    role: 'ASISTENTE'
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Roles disponibles (ajusta según tu enum)
  const ROLES = [
    { value: 'ASISTENTE', label: 'Asistente' },
    { value: 'ORGANIZADOR', label: 'Organizador' },
    { value: 'ADMIN', label: 'Administrador' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar email
    if (!formData.correo.trim()) {
      newErrors.correo = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = 'Ingresa un email válido';
    }

    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validar contraseña
    if (!formData.pasword) {
      newErrors.pasword = 'La contraseña es obligatoria';
    } else if (formData.pasword.length < 6) {
      newErrors.pasword = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Validar confirmación de contraseña
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.pasword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Validar rol
    if (!formData.role) {
      newErrors.role = 'Selecciona un rol';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Preparar datos para enviar (sin confirmPassword)
      const { confirmPassword, ...dataToSend } = formData;
      
      await AuthApi.register(dataToSend);
      
      // Mostrar mensaje de éxito y redirigir
      alert('Registro exitoso. Ahora puedes iniciar sesión.');
      navigate('/login');
      
    } catch (error) {
      console.error('Error en registro:', error);
      
      // Manejar diferentes tipos de errores
      if (error.response?.status === 400) {
        if (error.response.data.detail?.includes('email')) {
          setErrors({ general: 'Este email ya está registrado' });
        } else {
          setErrors({ general: error.response.data.detail || 'Error en el registro' });
        }
      } else if (error.response?.data?.detail) {
        setErrors({ general: error.response.data.detail });
      } else {
        setErrors({ general: 'Error de conexión. Intenta nuevamente.' });
      }
    }
  };

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6}>
          <Card className="shadow-lg border-0">
            <Card.Body className="p-5">
              {/* Header */}
              <div className="text-center mb-4">
                <h2 className="fw-bold text-primary mb-2">Crear Cuenta</h2>
                <p className="text-muted">Completa tus datos para registrarte</p>
              </div>

              {/* Error general */}
              {errors.general && (
                <Alert variant="danger" className="mb-4">
                  <i className="bi bi-exclamation-circle me-2"></i>
                  {errors.general}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row>
                  {/* Email */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label htmlFor="correo">
                        <i className="bi bi-envelope me-2"></i>
                        Email *
                      </Form.Label>
                      <Form.Control
                        type="email"
                        id="correo"
                        name="correo"
                        value={formData.correo}
                        onChange={handleInputChange}
                        placeholder="tu@email.com"
                        isInvalid={!!errors.correo}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.correo}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  {/* Nombre */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label htmlFor="nombre">
                        <i className="bi bi-person me-2"></i>
                        Nombre Completo *
                      </Form.Label>
                      <Form.Control
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        placeholder="Tu nombre completo"
                        isInvalid={!!errors.nombre}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.nombre}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  {/* Password */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label htmlFor="pasword">
                        <i className="bi bi-lock me-2"></i>
                        Contraseña *
                      </Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          id="pasword"
                          name="pasword"
                          value={formData.pasword}
                          onChange={handleInputChange}
                          placeholder="Mínimo 6 caracteres"
                          isInvalid={!!errors.pasword}
                        />
                        <Button
                          variant="link"
                          className="position-absolute end-0 top-50 translate-middle-y border-0"
                          style={{ zIndex: 10 }}
                          onClick={() => setShowPassword(!showPassword)}
                          type="button"
                        >
                          <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </Button>
                      </div>
                      <Form.Control.Feedback type="invalid">
                        {errors.pasword}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  {/* Confirm Password */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label htmlFor="confirmPassword">
                        <i className="bi bi-lock-fill me-2"></i>
                        Confirmar Contraseña *
                      </Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          type={showConfirmPassword ? "text" : "password"}
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="Repite tu contraseña"
                          isInvalid={!!errors.confirmPassword}
                        />
                        <Button
                          variant="link"
                          className="position-absolute end-0 top-50 translate-middle-y border-0"
                          style={{ zIndex: 10 }}
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          type="button"
                        >
                          <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </Button>
                      </div>
                      <Form.Control.Feedback type="invalid">
                        {errors.confirmPassword}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Role */}
                <Form.Group className="mb-4">
                  <Form.Label htmlFor="role">
                    <i className="bi bi-person-badge me-2"></i>
                    Rol
                  </Form.Label>
                  <Form.Select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    isInvalid={!!errors.role}
                  >
                    {ROLES.map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.role}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-100 mb-3"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        className="me-2"
                      />
                      Creando cuenta...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-person-plus me-2"></i>
                      Crear Cuenta
                    </>
                  )}
                </Button>

                {/* Login Link */}
                <div className="text-center">
                  <span className="text-muted">¿Ya tienes cuenta? </span>
                  <Link to="/login" className="text-decoration-none fw-bold">
                    Inicia sesión aquí
                  </Link>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;