import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, get_db
from app.models.user import User
from app.models.event import Evento, RegistroEvento, Sesion
from app.core.security import get_password_hash

DB_USER = "miseventos_user"
DB_PASSWORD = "miseventos_2024"
DB_NAME = "mis_eventos_db"
DB_HOST = "localhost"
DB_PORT = "5433"

SQLALCHEMY_DATABASE_URL = (
    f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

TABLE_NAMES = [
    "registros_eventos", 
    "sesiones",          
    "eventos",           
    "users",            
]

@pytest.fixture(name="db_session")
def db_session_fixture():
    """
    Fixture para una sesión de base de datos de prueba con PostgreSQL.
    Asegura que las tablas existan y limpia los datos antes de cada prueba.
    """
    Base.metadata.create_all(bind=engine) 
    
    db = TestingSessionLocal()
    try:
        for table_name in reversed(TABLE_NAMES):
            db.execute(text(f"TRUNCATE TABLE {table_name} RESTART IDENTITY CASCADE;"))
        db.commit()
        admin_user = User(
            nombre="Admin Test",
            email="admin@test.com",
            password=get_password_hash("testpassword"),
            role="ADMIN",
            is_active=True
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

        regular_user = User(
            nombre="User Test",
            email="user@test.com",
            password=get_password_hash("testpassword"),
            role="USER",
            is_active=True
        )
        db.add(regular_user)
        db.commit()
        db.refresh(regular_user)

        yield db
    finally:
        db.close()
