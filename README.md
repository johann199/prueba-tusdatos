Proyecto de Gestión de Eventos
Este proyecto es una aplicación web completa para la gestión de eventos, que consta de un backend desarrollado con FastAPI (Python) y un frontend construido con React.

🚀 Inicio Rápido con Docker Compose
La forma más sencilla de levantar todo el proyecto es usando Docker Compose.

Asegúrate de tener Docker y Docker Compose instalados.

Instalar Docker

Instalar Docker Compose

Clona este repositorio:

git clone https://github.com/tu-usuario/tu-repositorio.git
cd tu-repositorio

(Reemplaza tu-usuario/tu-repositorio.git con la URL real de tu repositorio).

Construye y levanta los servicios:

docker-compose up --build -d

--build: Construye las imágenes de Docker para el frontend y el backend.

-d: Ejecuta los servicios en segundo plano.

Accede a la aplicación:

Frontend (React): Abre tu navegador y ve a http://localhost:3000

Backend (FastAPI Docs): Accede a la documentación interactiva de la API en http://localhost:8000/docs

pgAdmin: Accede a la interfaz de pgAdmin en http://localhost:5050

Email: admin@miseventos.com

Contraseña: admin123

Para conectar a la base de datos:

Host: postgres (este es el nombre del servicio de la DB en docker-compose.yml)

Port: 5432 (puerto interno del contenedor postgres)

Database: mis_eventos_db

Username: miseventos_user

Password: miseventos_2024

💻 Instalación y Ejecución Local (Sin Docker)
Si prefieres ejecutar el proyecto directamente en tu máquina local, sigue estos pasos:

Prerrequisitos
Python 3.10+

Node.js 18+ y Yarn (o npm)

PostgreSQL (debes tener una instancia de PostgreSQL corriendo localmente, o puedes usar la de Docker Compose solo para la DB).

1. Configuración del Backend (FastAPI)
Navega al directorio del backend:

cd backend

Crea y activa un entorno virtual:

python -m venv ven
source ven/bin/activate  # En Linux/macOS
# ven\Scripts\activate  # En Windows

Instala las dependencias de Python:

pip install -r requirements.txt

Configura la base de datos:

Asegúrate de que tu instancia de PostgreSQL esté corriendo.

Crea una base de datos llamada mis_eventos_db (o la que uses en tu DATABASE_URL).

Actualiza la variable de entorno DATABASE_URL para que apunte a tu base de datos local. Puedes crear un archivo .env en el directorio backend con el siguiente contenido:

DATABASE_URL="postgresql://miseventos_user:miseventos_2024@localhost:5433/mis_eventos_db"
SECRET_KEY="tu_clave_secreta_aqui" # ¡CAMBIA ESTO!
ACCESS_TOKEN_EXPIRE_MINUTES=30

(Asegúrate de que localhost:5433 sea el puerto donde tu PostgreSQL local está escuchando).

Ejecuta las migraciones de la base de datos (si usas Alembic o similar):
Si tienes un sistema de migraciones (como Alembic), ejecútalo para crear las tablas. Si no, las tablas se crearán automáticamente cuando Uvicorn intente conectarse y Base.metadata.create_all se ejecute (aunque esto no es lo ideal para producción).

Inicia el servidor de FastAPI:

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

El backend estará disponible en http://localhost:8000.

2. Configuración del Frontend (React)
Navega al directorio del frontend:

cd frontend

Instala las dependencias de Node.js con Yarn:

yarn install

(Si usas npm: npm install)

Inicia el servidor de desarrollo de React:

yarn start

(Si usas npm: npm start)
El frontend estará disponible en http://localhost:3000.
