from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.models.user import Roles


class UserBase(BaseModel):
    email: EmailStr
    nombre: Optional[str] = None
    role: Optional[Roles] = Roles.ASISTENTE

    class Config:
        allow_population_by_field_name = True
        from_attributes = True


class UserCreate(UserBase):
    nombre: str
    password: str


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    nombre: Optional[str] = None
    role: Optional[Roles] = None
    is_active: Optional[bool] = None

    class Config:
        allow_population_by_field_name = True


class UserInDB(UserBase):
    id: int
    is_active: bool = True
    creado: datetime
    modificado: Optional[datetime] = None

    class Config:
        allow_population_by_field_name = True
        from_attributes = True


class UserResponse(UserInDB):
    pass


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str