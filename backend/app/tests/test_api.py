from fastapi import status
from app.models.event import Evento, RegistroEvento, EstadosEvento
from app.models.user import User
from app.core.security import create_access_token
from datetime import timedelta
from app.core.config import settings

# Fixture para obtener un token de acceso para un usuario de prueba
def get_test_token(email: str):
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return create_access_token(
        data={"sub": email},
        expires_delta=access_token_expires
    )

def test_register_user_success(client):
    """Prueba el registro exitoso de un nuevo usuario."""
    response = client.post(
        "/auth/registrar/",
        json={
            "email": "newuser@test.com",
            "password": "securepassword",
            "nombre": "New User",
            "role": "USER"
        }
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["email"] == "newuser@test.com"
    assert data["nombre"] == "New User"
    assert data["role"] == "USER"
    assert "id" in data
    assert "password" not in data

def test_register_user_email_exists(client):
    """Prueba el registro de un usuario con un email ya existente."""
    response = client.post(
        "/auth/registrar/",
        json={
            "email": "admin@test.com",
            "password": "anypassword",
            "nombre": "Duplicate User",
            "role": "USER"
        }
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json()["detail"] == "El email ya está registrado"

def test_login_user_success(client):
    """Prueba el inicio de sesión exitoso de un usuario."""
    response = client.post(
        "/auth/login",
        data={"username": "admin@test.com", "password": "testpassword"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_user_invalid_credentials(client):
    """Prueba el inicio de sesión con credenciales inválidas."""
    response = client.post(
        "/auth/login",
        data={"username": "admin@test.com", "password": "wrongpassword"}
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json()["detail"] == "Correo o contraseña incorrectos"

def test_get_events_empty(client):
    """Prueba obtener eventos cuando no hay ninguno."""
    response = client.get("/eventos/")
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()["detail"] == "No se encontraron eventos"

def test_create_event_success(client, db_session):
    """Prueba la creación exitosa de un evento por un usuario autenticado."""
    admin_token = get_test_token("admin@test.com")
    
    response = client.post(
        "/eventos/registrar/",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "titulo": "Mi Primer Evento",
            "descripcion": "Descripción del evento de prueba.",
            "fecha_inicio": "2025-08-01T10:00:00Z",
            "fecha_fin": "2025-08-01T18:00:00Z",
            "lugar": "Online",
            "capacidad": 50
        }
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["titulo"] == "Mi Primer Evento"
    assert data["creador"]["nombre"] == "Admin Test" 
    assert data["estado"] == "PENDIENTE" 
    assert "id" in data

    event_in_db = db_session.query(Evento).filter(Evento.id == data["id"]).first()
    assert event_in_db is not None
    assert event_in_db.titulo == "Mi Primer Evento"

def test_register_for_event_success(client, db_session):
    """
    Prueba el registro exitoso de un usuario en un evento.
    Esto es crucial para verificar la corrección del ResponseValidationError.
    """
    admin_token = get_test_token("admin@test.com")
    user_token = get_test_token("user@test.com")

   
    create_event_response = client.post(
        "/eventos/registrar/",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "titulo": "Evento para Registro",
            "descripcion": "Evento de prueba para registrarse.",
            "fecha_inicio": "2025-09-01T09:00:00Z",
            "fecha_fin": "2025-09-01T17:00:00Z",
            "lugar": "Sala A",
            "capacidad": 10
        }
    )
    assert create_event_response.status_code == status.HTTP_201_CREATED
    event_id = create_event_response.json()["id"]

    
    response = client.post(
        f"/eventos/registro/evento/{event_id}/", 
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert "id" in data
    assert data["user"]["nombre"] == "User Test" 
    assert data["evento"]["titulo"] == "Evento para Registro" 
    assert data["confirmado"] == True


    event_in_db = db_session.query(Evento).filter(Evento.id == event_id).first()
    assert event_in_db.registrado == 1

def test_register_for_event_already_registered(client, db_session):
    """Prueba intentar registrarse en un evento donde el usuario ya está registrado."""
    admin_token = get_test_token("admin@test.com")
    user_token = get_test_token("user@test.com")

   
    create_event_response = client.post(
        "/eventos/registrar/",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "titulo": "Evento Duplicado",
            "descripcion": "Para probar registro duplicado.",
            "fecha_inicio": "2025-10-01T09:00:00Z",
            "fecha_fin": "2025-10-01T17:00:00Z",
            "lugar": "Sala B",
            "capacidad": 5
        }
    )
    event_id = create_event_response.json()["id"]


    client.post(
        f"/eventos/registro/evento/{event_id}/",
        headers={"Authorization": f"Bearer {user_token}"}
    )

    response = client.post(
        f"/eventos/registro/evento/{event_id}/",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == status.HTTP_409_CONFLICT
    assert response.json()["detail"] == "Ya estás registrado en este evento"

def test_register_for_event_full_capacity(client, db_session):
    """Prueba intentar registrarse en un evento con capacidad llena."""
    admin_token = get_test_token("admin@test.com")
    user_token = get_test_token("user@test.com")

   
    create_event_response = client.post(
        "/eventos/registrar/",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "titulo": "Evento Lleno",
            "descripcion": "Para probar capacidad llena.",
            "fecha_inicio": "2025-11-01T09:00:00Z",
            "fecha_fin": "2025-11-01T17:00:00Z",
            "lugar": "Sala C",
            "capacidad": 1 
        }
    )
    event_id = create_event_response.json()["id"]

    
    client.post(
        f"/eventos/registro/evento/{event_id}/",
        headers={"Authorization": f"Bearer {user_token}"}
    )

    event_in_db = db_session.query(Evento).filter(Evento.id == event_id).first()
    event_in_db.registrado = event_in_db.capacidad 
    db_session.commit()
    db_session.refresh(event_in_db)

    
    response = client.post(
        f"/eventos/registro/evento/{event_id}/",
        headers={"Authorization": f"Bearer {user_token}"} 
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json()["detail"] == "El evento ha alcanzado su capacidad máxima"
