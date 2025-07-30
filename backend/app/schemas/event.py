from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.event import EstadosEvento

# Esquemas para Eventos

class UserForEvent(BaseModel):
    id: int
    nombre: str
    class Config:
        from_attributes = True
class EventoBase(BaseModel):
    titulo: str
    descripcion: str
    fecha_inicio: datetime
    fecha_fin: datetime
    lugar: Optional[str] = None
    capacidad: int = 100

class EventoCreate(EventoBase):
    pass

class EventoUpdate(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    fecha_inicio: Optional[datetime] = None
    fecha_fin: Optional[datetime] = None
    lugar: Optional[str] = None
    capacidad: Optional[int] = None
    estado: Optional[EstadosEvento] = None

class EventoResponse(EventoBase):
    id: int
    estado: EstadosEvento
    registrado: int
    creador: UserForEvent
    creado: datetime
    modificado: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Esquemas para Sesiones
class SesionBase(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    fecha_inicio: datetime
    fecha_fin: datetime
    nombre_orador: str
    biografia_orador: Optional[str] = None
    capacidad: int = 50

class SesionCreate(SesionBase):
    evento_id: int

class SesionUpdate(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    fecha_inicio: Optional[datetime] = None
    fecha_fin: Optional[datetime] = None
    nombre_orador: Optional[str] = None
    biografia_orador: Optional[str] = None
    capacidad: Optional[int] = None

class SesionResponse(SesionBase):
    id: int
    evento_id: int
    creado: datetime
    modificado: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Esquemas para Registros
class RegistroEventoResponse(BaseModel):
    id: int
    user: UserForEvent
    evento: EventoBase
    registrado_en: datetime
    confirmado: bool
    
    class Config:
        from_attributes = True

# Respuesta completa con sesiones
class EventoCompleto(EventoResponse):
    sesiones: List[SesionResponse] = []