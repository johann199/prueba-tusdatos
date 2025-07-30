from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum

# Clase para guardar los roles de los usuarios.
class Roles(enum.Enum):
    ADMIN = "Admin"
    ORGANIZADOR = "Organizador"
    ASISTENTE = "Asistente"

# Clase que representa la tabla de usuarios en la base de datos.
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    nombre = Column(String)
    role = Column(Enum(Roles), default=Roles.ASISTENTE)
    is_active = Column(Boolean, default=True)
    creado = Column(DateTime(timezone=True), server_default=func.now())
    modificado = Column(DateTime(timezone=True), server_default=func.now())

    eventos_creados = relationship("Evento", back_populates="creador")
    inscripciones = relationship("RegistroEvento", back_populates="usuario")
