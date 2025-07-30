from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import *
from app.core.security import *
from app.core.config import settings
from passlib.context import CryptContext

router = APIRouter()


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user_by_email(db: Session, email: str):
    """Obtener usuario por correo"""
    return db.query(User).filter(User.email == email).first()

def authenticate_user(db: Session, username: str, password: str):
    user = db.query(User).filter(User.email == username).first()  
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Obtener usuario actual desde el token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        email = verify_token(token)
        if email is None:
            raise credentials_exception
    except:
        raise credentials_exception
    
    user = get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    return user

@router.get("/users/", response_model=list[UserResponse],
        summary="Obtener lista de todos los usuarios",
        description="Recupera una lista de todos los usuarios registrados en el sistema.",
        response_description="Lista de objetos UserResponse.",
        responses={
            status.HTTP_200_OK: {"description": "Lista de usuarios recuperada exitosamente."},
            status.HTTP_401_UNAUTHORIZED: {"description": "No autenticado. Se requiere un token de acceso válido."},
            status.HTTP_403_FORBIDDEN: {"description": "No autorizado. El usuario no tiene permisos para ver esta lista."}})
def obtener_usuarios(db: Session = Depends(get_db)):
    """Obtener lista de usuarios"""
    usuarios = db.query(User).all()
    return usuarios

@router.post("/registrar/", response_model=UserResponse,
        summary="Registrar un nuevo usuario",
        description="Permite crear una nueva cuenta de usuario en el sistema con un email, nombre, contraseña y rol.",
        response_description="Objeto UserResponse del usuario recién creado.",
        responses={
            status.HTTP_201_CREATED: {"description": "Usuario registrado exitosamente."},
            status.HTTP_400_BAD_REQUEST: {"description": "El email proporcionado ya está registrado."},
            status.HTTP_422_UNPROCESSABLE_ENTITY: {"description": "Error de validación de datos de entrada (ej. formato de email inválido, contraseña débil)."},
            status.HTTP_500_INTERNAL_SERVER_ERROR: {"description": "Error interno del servidor durante el registro."}
        } )
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """Registrar nuevo usuario"""
    # Verificar si el usuario ya existe
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="El email ya está registrado"
        )
    
    # Crear nuevo usuario
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        password=hashed_password,
        nombre=user.nombre,
        role=user.role
    )
    
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        print("Usuario creado exitosamente:", db_user.email)
        
        return UserResponse.model_validate(db_user)
        
    except Exception as e:
        db.rollback()
        print("Error creando usuario:", str(e))
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

@router.put("/actualizar/{user_id}", response_model=UserResponse,
        summary="Actualizar la información de un usuario",
        description="Actualiza los detalles de un usuario específico por su ID. Se requiere autenticación y, opcionalmente, permisos de administrador.",
        response_description="Objeto UserResponse del usuario actualizado.",
        responses={
            status.HTTP_200_OK: {"description": "Usuario actualizado exitosamente."},
            status.HTTP_401_UNAUTHORIZED: {"description": "No autenticado."},
            status.HTTP_403_FORBIDDEN: {"description": "No tienes permisos para actualizar este usuario."},
            status.HTTP_404_NOT_FOUND: {"description": "Usuario no encontrado."},
            status.HTTP_422_UNPROCESSABLE_ENTITY: {"description": "Error de validación de datos de entrada."},
            status.HTTP_500_INTERNAL_SERVER_ERROR: {"description": "Error interno del servidor durante la actualización."}
        })
def update_user(user_id: int, user: UserUpdate, db: Session = Depends(get_db)):
    """Actualizar usuario"""
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if user.email:
        db_user.email = user.email
    if user.nombre:
        db_user.nombre = user.nombre
    if user.role:
        db_user.role = user.role
    if user.is_active is not None:
        db_user.is_active = user.is_active
    
    try:
        db.commit()
        db.refresh(db_user)
        return UserResponse.model_validate(db_user)
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

@router.delete("/eliminar/{user_id}", response_model=UserResponse, 
            summary="Eliminar un usuario",
            description="Elimina un usuario específico del sistema por su ID. Requiere autenticación y permisos de administrador.",
            response_description="Objeto UserResponse del usuario eliminado (o un mensaje de éxito).",
            responses={
                status.HTTP_200_OK: {"description": "Usuario eliminado exitosamente."},
                status.HTTP_401_UNAUTHORIZED: {"description": "No autenticado."},
                status.HTTP_403_FORBIDDEN: {"description": "No tienes permisos para eliminar este usuario."},
                status.HTTP_404_NOT_FOUND: {"description": "Usuario no encontrado."},
                status.HTTP_500_INTERNAL_SERVER_ERROR: {"description": "Error interno del servidor durante la eliminación."}
            })
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """Eliminar usuario"""
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    try:
        db.delete(db_user)
        db.commit()
        return UserResponse.model_validate(db_user)
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

@router.post("/login", response_model=Token,
        summary="Iniciar sesión de usuario",
        description="Autentica a un usuario con su correo electrónico y contraseña, devolviendo un token de acceso JWT.",
        response_description="Objeto Token con el token de acceso y tipo 'bearer'.",
        responses={
            status.HTTP_200_OK: {"description": "Inicio de sesión exitoso, token de acceso generado."},
            status.HTTP_401_UNAUTHORIZED: {"description": "Correo o contraseña incorrectos, o credenciales inválidas."}
        })
def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login de usuario con correo y contraseña"""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


