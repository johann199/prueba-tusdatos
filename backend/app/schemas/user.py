from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.models.user import Roles


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: Optional[Roles] = Roles.ASISTENTE


class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[Roles] = None
    is_active: Optional[bool] = None

class UserInDB(UserBase):
    id: int
    is_active: bool = True
    creado: datetime
    modificado: Optional[datetime] = None

    class Config:
        from_attributes = True

class User(UserInDB):
    pass

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str