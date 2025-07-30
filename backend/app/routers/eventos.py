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
from sqlalchemy.orm import joinedload

router = APIRouter()

"""Endpoins para todos los modelos de eventos."""
# ENPOINS PARA LOS EVENTOS. 
@router.get("/", response_model=List[EventoResponse], 
            summary="Obtener Lista de eventos", 
            description="Lista todos los eventos registrados independientes del usuario.",
            responses= {
                status.HTTP_200_OK: {"description": "Lista de eventos recuperada exitosamente."},
                status.HTTP_404_NOT_FOUND: {"description": "No se encontraron eventos en el sistema."}
            })
def get_eventos(
    skip: int = 0, 
    limit: int = 10,
    search: Optional[str] = Query(None, description="Buscar por título"),
    db: Session = Depends(get_db)
):
    """Obtener lista de eventos con paginación y búsqueda"""
    query = db.query(Evento)
    if search:
        query = query.filter(
            or_(
                Evento.titulo.ilike(f"%{search}%"),
                Evento.descripcion.ilike(f"%{search}%")
            )
        )
    eventos = query.offset(skip).limit(limit).all()
    return eventos

@router.get("/{evento_id}", response_model=EventoCompleto, 
            summary="Obtener detalles de un evento por ID",
            description="Recupera los detalles completos de un evento específico, incluyendo sus sesiones asociadas y la información del creador.",
            response_description="Objeto EventoCompleto con todos los detalles del evento.",
            responses={
                status.HTTP_200_OK: {"description": "Detalles del evento recuperados exitosamente."},
                status.HTTP_404_NOT_FOUND: {"description": "El evento con el ID especificado no fue encontrado."}
            })
def get_evento(evento_id: int, db: Session = Depends(get_db)):
    """Obtener evento por ID con sus sesiones"""
    evento = db.query(Evento).filter(Evento.id == evento_id).first()
    if not evento:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    return evento

@router.post("/registrar/", response_model=EventoResponse, 
            summary="Crear un nuevo evento",
            description="Permite a un usuario autenticado crear un nuevo evento en el sistema. El creador del evento se asigna automáticamente al usuario actual.",
            response_description="Objeto EventoResponse del evento recién creado.",
            responses={
                status.HTTP_201_CREATED: {"description": "Evento creado exitosamente."},
                status.HTTP_400_BAD_REQUEST: {"description": "La fecha de inicio es posterior o igual a la fecha de fin."},
                status.HTTP_401_UNAUTHORIZED: {"description": "No autenticado. Se requiere un token de acceso válido."},
                status.HTTP_422_UNPROCESSABLE_ENTITY: {"description": "Error de validación de datos de entrada."}
            })
def crear_evento(
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

@router.put("/actualizar/{evento_id}", response_model=EventoResponse, 
            summary="Actualizar un evento existente",
            description="Actualiza la información de un evento específico. Solo el creador del evento tiene permisos para editarlo.",
            response_description="Objeto EventoResponse del evento actualizado.",
            responses={
                status.HTTP_200_OK: {"description": "Evento actualizado exitosamente."},
                status.HTTP_400_BAD_REQUEST: {"description": "Datos de actualización inválidos."},
                status.HTTP_401_UNAUTHORIZED: {"description": "No autenticado."},
                status.HTTP_403_FORBIDDEN: {"description": "No tienes permisos para editar este evento."},
                status.HTTP_404_NOT_FOUND: {"description": "El evento no fue encontrado."},
                status.HTTP_422_UNPROCESSABLE_ENTITY: {"description": "Error de validación de datos de entrada."}
            })
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

@router.delete("/eliminar/{evento_id}", 
            summary="Eliminar un evento",
            description="Elimina un evento específico del sistema. Solo el creador del evento tiene permisos para eliminarlo.",
            response_description="Mensaje de confirmación de eliminación.",
            responses={
                status.HTTP_200_OK: {"description": "Evento eliminado exitosamente."},
                status.HTTP_401_UNAUTHORIZED: {"description": "No autenticado."},
                status.HTTP_403_FORBIDDEN: {"description": "No tienes permisos para eliminar este evento."},
                status.HTTP_404_NOT_FOUND: {"description": "El evento no fue encontrado."}
            })
def eliminar_evento(
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


@router.get("/mis/eventos", response_model=List[EventoResponse], 
            summary="Obtener eventos en los que el usuario está registrado",
            description="Recupera una lista de eventos en los que el usuario autenticado se ha registrado.",
            response_description="Lista de objetos EventoResponse de los eventos registrados.",
            responses={
                status.HTTP_200_OK: {"description": "Lista de eventos registrados recuperada exitosamente."},
                status.HTTP_401_UNAUTHORIZED: {"description": "No autenticado."}
            })
def get_mis_eventos(
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
@router.post("/{evento_id}/sesiones", response_model=SesionResponse, 
            summary="Crear una nueva sesión para un evento",
            description="Permite al creador de un evento añadir una nueva sesión a ese evento. La sesión debe estar dentro del rango de fechas del evento principal.",
            response_description="Objeto SesionResponse de la sesión recién creada.",
            responses={
                status.HTTP_201_CREATED: {"description": "Sesión creada exitosamente."},
                status.HTTP_400_BAD_REQUEST: {"description": "La sesión no está dentro del rango de fechas del evento o datos inválidos."},
                status.HTTP_401_UNAUTHORIZED: {"description": "No autenticado."},
                status.HTTP_403_FORBIDDEN: {"description": "No tienes permisos para crear sesiones en este evento."},
                status.HTTP_404_NOT_FOUND: {"description": "El evento principal no fue encontrado."},
                status.HTTP_422_UNPROCESSABLE_ENTITY: {"description": "Error de validación de datos de entrada."}
            })
def crear_sesion(
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

@router.get("/{evento_id}/sesiones/", response_model=List[SesionResponse], 
        summary="Obtener sesiones de un evento",
        description="Recupera una lista de todas las sesiones asociadas a un evento específico.",
        response_description="Lista de objetos SesionResponse.",
        responses={
            status.HTTP_200_OK: {"description": "Sesiones recuperadas exitosamente."},
            status.HTTP_404_NOT_FOUND: {"description": "El evento no fue encontrado (aunque el endpoint devuelve una lista vacía si no hay sesiones)."}
        })
def get_sesiones_evento(
    evento_id: int,
    db: Session = Depends(get_db)
):
    """Obtener todas las sesiones de un evento"""
    sesiones = db.query(Sesion).filter(Sesion.evento_id == evento_id).all()
    return sesiones

# ENDPOINTS PARA REGISTROS A EVENTOS
@router.get("/registros/{registro_id}", response_model=RegistroEventoResponse)
def get_registro(registro_id: int, db: Session = Depends(get_db)):
    registro = db.query(RegistroEvento).options(
        joinedload(RegistroEvento.user),
        joinedload(RegistroEvento.evento)
    ).filter(RegistroEvento.id == registro_id).first()
    if not registro:
        raise HTTPException(status_code=404, detail="Registro no encontrado")
    return registro

@router.post("/registro/evento/{event_id}/", response_model=RegistroEventoResponse, 
            status_code=status.HTTP_201_CREATED,
            summary="Registrar usuario en un evento",
            description="Registra al usuario autenticado en un evento específico. Verifica la existencia del evento, si el usuario ya está registrado y la capacidad del evento.",
            response_description="Objeto RegistroEventoResponse del registro creado.",
            responses={
                status.HTTP_201_CREATED: {"description": "Usuario registrado en el evento exitosamente."},
                status.HTTP_400_BAD_REQUEST: {"description": "El evento ha alcanzado su capacidad máxima."},
                status.HTTP_401_UNAUTHORIZED: {"description": "No autenticado. Se requiere un token de acceso válido."},
                status.HTTP_404_NOT_FOUND: {"description": "El evento no fue encontrado."},
                status.HTTP_409_CONFLICT: {"description": "El usuario ya está registrado en este evento."}
            })
def evento_usuario(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Registra al usuario autenticado en un evento específico.
    """
    event = db.query(Evento).filter(Evento.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evento no encontrado")

    existing_registration = db.query(RegistroEvento).filter(
        RegistroEvento.user_id == current_user.id,
        RegistroEvento.evento_id == event_id
    ).first()
    if existing_registration:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ya estás registrado en este evento")
    
    if event.registrado >= event.capacidad:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El evento ha alcanzado su capacidad máxima")

    new_registration = RegistroEvento(
        user_id=current_user.id,
        evento_id=event_id,
        confirmado=True 
    )
    db.add(new_registration)
    
    event.registrado += 1

    db.commit()
    db.refresh(new_registration)
    db.refresh(event)
    db_registration_with_details = db.query(RegistroEvento).options(
        joinedload(RegistroEvento.user),
        joinedload(RegistroEvento.evento)
    ).filter(RegistroEvento.id == new_registration.id).first()
    
    return db_registration_with_details