# Guía de Ejecución del Sistema GAD Jaramijó

## Requisitos previos

1. **PostgreSQL** instalado (versión 12 o superior)
2. **Node.js** (versión 16 o superior)
3. **npm** (versión 8 o superior)
4. **pgAdmin** (opcional, para administrar la base de datos visualmente)

## Pasos para iniciar el sistema

### 1. Configurar la Base de Datos

#### Verificar que PostgreSQL esté corriendo
```powershell
# Verificar servicio de PostgreSQL
Get-Service postgresql*
```

Si no está iniciado, puedes iniciarlo con:
```powershell
Start-Service postgresql*
```

#### Crear la base de datos (si no existe)
Usando psql (herramienta de línea de comandos de PostgreSQL):
```powershell
psql -U postgres
```

```sql
CREATE DATABASE gad_db;
CREATE USER postgres WITH ENCRYPTED PASSWORD 'admin';
GRANT ALL PRIVILEGES ON DATABASE gad_db TO postgres;
\q
```

### 2. Configurar la aplicación

#### Verificar la configuración en .env
Asegúrate de que el archivo `.env` tenga la configuración correcta para tu instalación de PostgreSQL:

```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=admin
DB_DATABASE=gad_db
```

#### Instalar dependencias
```powershell
cd c:\Users\micro\Desktop\gad-app\backend-gad-jaramijo
npm install
```

### 3. Probar la conexión a la base de datos
```powershell
node test-db-connection.js
```

Deberías ver un mensaje indicando "¡Conexión exitosa a PostgreSQL!" y una lista de tablas (posiblemente vacía si es la primera ejecución).

### 4. Iniciar la aplicación
```powershell
npm run start:dev
```

La primera vez que inicias la aplicación con `synchronize: true` (configurado en el app.module.ts), NestJS creará automáticamente las tablas basadas en tus entidades.

### 5. Insertar datos de prueba
```powershell
node init-db.js
```

Este script creará:
- 3 direcciones administrativas
- 5 departamentos distribuidos entre las direcciones
- 1 usuario administrador con credenciales:
  - Correo: admin@gadjaramijo.gob.ec
  - Contraseña: 123456

### 6. Acceder a la API

La API estará disponible en: http://localhost:3000/api

#### Endpoints principales:
- **Autenticación**: `POST /api/auth/login`
- **Direcciones**: `GET /api/direcciones`
- **Departamentos**: `GET /api/departamentos`
- **Usuarios**: `GET /api/usuarios`

## Configuración de pgAdmin

1. Abre pgAdmin
2. Clic derecho en "Servers" → "Create" → "Server..."
3. En la pestaña "General", nombra la conexión (ej: "GAD Jaramijó")
4. En la pestaña "Connection":
   - Host: localhost (o la dirección IP del servidor)
   - Port: 5432
   - Username: postgres (o el usuario configurado)
   - Password: postgres (o la contraseña configurada)
5. Clic en "Save"

Una vez conectado, podrás navegar a:
Servers → GAD Jaramijó → Databases → gad_db → Schemas → public → Tables

Allí encontrarás todas las tablas del sistema y podrás realizar consultas directamente.

## Solución de problemas comunes

### Error de conexión a la base de datos
- Verifica que PostgreSQL esté en ejecución
- Comprueba la configuración en el archivo `.env`
- Asegúrate de que la base de datos `gad_db` exista

### Error en las relaciones entre entidades
- Las relaciones se configuran automáticamente al iniciar la aplicación
- Si modificaste alguna entidad, puede ser necesario eliminar y recrear la base de datos

### Error "Usuario o contraseña inválidos"
- Utiliza las credenciales del usuario administrador creado por el script:
  - Correo: admin@gadjaramijo.gob.ec
  - Contraseña: 123456
