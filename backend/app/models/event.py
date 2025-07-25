from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum

# Clase para guardar los estados de los eventos.
class EstadosEvento(enum.Enum):
    PENDIENTE = "Pendiente"
    EN_CURSO = "En curso"
    FINALIZADO = "Finalizado"
    CANCELADO = "Cancelado"

# Clase que representa la tabla de eventos en la base de datos.
class Evento(Base):
    __tablename__ = "eventos"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, nullable=False)
    descripcion = Column(Text, nullable=False)
    fecha_inicio = Column(DateTime, nullable=False)
    fecha_fin = Column(DateTime, nullable=False)
    lugar = Column(String)
    capacidad = Column(Integer, default=100, nullable=False)
    registrado = Column(Integer, default=0, nullable=False)
    estado = Column(Enum(EstadosEvento), default=EstadosEvento.PENDIENTE)
    creado = Column(DateTime(timezone=True), server_default=func.now())
    modificado = Column(DateTime(timezone=True), server_default=func.now())
    # Relaciones con  usuarios y sesiones
    creador_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    creador = relationship("User", back_populates="responsable_eventos")
    sesion = relationship("Sesion", back_populates="evento")
    inscripciones = relationship("RegistroEvento", back_populates="evento")

# Clase que representa las sesiones de un evento.
class Sesion(Base):
    __tablename__ = "sesiones"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, nullable=False)
    descripcion = Column(Text)
    fecha_inicio = Column(DateTime, nullable=False)
    fecha_fin = Column(DateTime, nullable=False)
    nombre_orador = Column(String, nullable=False)
    biografia_orador = Column(Text)
    capacidad = Column(Integer, default=50, nullable=False)
    creado = Column(DateTime(timezone=True), server_default=func.now())
    modificado = Column(DateTime(timezone=True), server_default=func.now())
    # Relaciones con eventos
    evento_id = Column(Integer, ForeignKey("eventos.id"), nullable=False)
    evento = relationship("Evento", back_populates="sesiones")

# Clase que representa el registro de usuarios en eventos.
class RegistroEvento(Base):
    __tablename__ = "registro_eventos"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    evento_id = Column(Integer, ForeignKey("eventos.id"), nullable=False)
    registrado_en = Column(DateTime(timezone=True), server_default=func.now())
    confirmado = Column(Boolean, default=False)

    user = relationship("User", back_populates="registro_evento")
    evento = relationship("Evento", back_populates="inscripciones")