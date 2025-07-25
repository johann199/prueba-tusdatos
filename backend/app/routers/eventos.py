from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional, List
from app.database import get_db
from app.models.event import Evento, RegistroEvento, EstadosEvento, Sesion
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.event import (
    EventoCreate, EventoUpdate, EventoResponse, EventoCompleto,
    SesionCreate, SesionUpdate, SesionResponse, RegistroEventoResponse
)

router = APIRouter()

@router.get("/", response_model=List[EventoResponse])
def get_eventos(
    skip: int = 0, 
    limit: int = 10,
    search: Optional[str] = Query(None, description="Buscar por título"),
    db: Session = Depends(get_db)
):
    """Obtener lista de eventos con paginación y búsqueda"""
    query = db.query(Evento)
    
    # Filtrar por búsqueda si se proporciona
    if search:
        query = query.filter(
            or_(
                Evento.titulo.ilike(f"%{search}%"),
                Evento.descripcion.ilike(f"%{search}%")
            )
        )
    
    # Paginación
    eventos = query.offset(skip).limit(limit).all()
    return eventos

@router.get("/{evento_id}", response_model=EventoCompleto)
def get_evento(evento_id: int, db: Session = Depends(get_db)):
    """Obtener evento por ID con sus sesiones"""
    evento = db.query(Evento).filter(Evento.id == evento_id).first()
    if not evento:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    return evento

@router.post("/", response_model=EventoResponse)
def create_evento(
    evento: EventoCreate, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Crear nuevo evento"""
    # Validar fechas
    if evento.fecha_inicio >= evento.fecha_fin:
        raise HTTPException(
            status_code=400, 
            detail="La fecha de inicio debe ser anterior a la fecha de fin"
        )
    
    db_evento = Evento(
        **evento.dict(),
        creador_id=current_user.id
    )
    db.add(db_evento)
    db.commit()
    db.refresh(db_evento)
    return db_evento

@router.put("/{evento_id}", response_model=EventoResponse)
def update_evento(
    evento_id: int,
    evento_update: EventoUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Actualizar evento"""
    db_evento = db.query(Evento).filter(Evento.id == evento_id).first()
    if not db_evento:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    
    # Verificar que el usuario es el creador del evento
    if db_evento.creador_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permisos para editar este evento")
    
    # Actualizar campos
    update_data = evento_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_evento, field, value)
    
    # Actualizar fecha de modificación
    from sqlalchemy.sql import func
    db_evento.modificado = func.now()
    
    db.commit()
    db.refresh(db_evento)
    return db_evento

@router.delete("/{evento_id}")
def delete_evento(
    evento_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Eliminar evento"""
    db_evento = db.query(Evento).filter(Evento.id == evento_id).first()
    if not db_evento:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    
    # Verificar que el usuario es el creador del evento
    if db_evento.creador_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permisos para eliminar este evento")
    
    db.delete(db_evento)
    db.commit()
    return {"message": "Evento eliminado exitosamente"}

@router.post("/{evento_id}/registrar")
def registrar_a_evento(
    evento_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Registrarse a un evento"""
    # Verificar que el evento existe
    evento = db.query(Evento).filter(Evento.id == evento_id).first()
    if not evento:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    
    # Verificar que no está ya registrado
    existing_registration = db.query(RegistroEvento).filter(
        RegistroEvento.evento_id == evento_id,
        RegistroEvento.user_id == current_user.id
    ).first()
    
    if existing_registration:
        raise HTTPException(status_code=400, detail="Ya estás registrado en este evento")
    
    # Verificar capacidad
    if evento.registrado >= evento.capacidad:
        raise HTTPException(status_code=400, detail="Evento lleno")
    
    # Crear registro
    registro = RegistroEvento(
        evento_id=evento_id,
        user_id=current_user.id
    )
    db.add(registro)
    
    # Actualizar contador
    evento.registrado += 1
    
    db.commit()
    return {"message": "Registrado exitosamente al evento"}

@router.get("/mis/registros", response_model=List[EventoResponse])
def get_mis_registros(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtener eventos en los que estoy registrado"""
    registros = db.query(RegistroEvento).filter(
        RegistroEvento.user_id == current_user.id
    ).all()
    
    eventos = [registro.evento for registro in registros]
    return eventos

# ENDPOINTS PARA SESIONES
@router.post("/{evento_id}/sesiones", response_model=SesionResponse)
def create_sesion(
    evento_id: int,
    sesion: SesionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Crear nueva sesión para un evento"""
    # Verificar que el evento existe
    evento = db.query(Evento).filter(Evento.id == evento_id).first()
    if not evento:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    
    # Verificar que es el creador del evento
    if evento.creador_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permisos para crear sesiones en este evento")
    
    # Validar que la sesión esté dentro del rango del evento
    if (sesion.fecha_inicio < evento.fecha_inicio or 
        sesion.fecha_fin > evento.fecha_fin):
        raise HTTPException(
            status_code=400, 
            detail="La sesión debe estar dentro del rango de fechas del evento"
        )
    
    db_sesion = Sesion(
        **sesion.dict()
    )
    db.add(db_sesion)
    db.commit()
    db.refresh(db_sesion)
    return db_sesion

@router.get("/{evento_id}/sesiones", response_model=List[SesionResponse])
def get_sesiones_evento(
    evento_id: int,
    db: Session = Depends(get_db)
):
    """Obtener todas las sesiones de un evento"""
    sesiones = db.query(Sesion).filter(Sesion.evento_id == evento_id).all()
    return sesiones