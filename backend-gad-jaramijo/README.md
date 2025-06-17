# Backend GAD Jaramijó

Este es el backend para la aplicación del GAD Municipal de Jaramijó, desarrollado con NestJS y PostgreSQL.

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
</p>

## Estructura del proyecto

El proyecto está organizado en varios módulos:

- **Auth**: Autenticación y autorización con JWT
- **Usuarios**: Gestión de usuarios
- **Direcciones**: Gestión de direcciones administrativas
- **Departamentos**: Gestión de departamentos pertenecientes a direcciones
- **Permisos**: Gestión de permisos de usuario por departamento y dirección

## Requisitos

- Node.js (v16 o superior)
- npm (v8 o superior)
- PostgreSQL (v12 o superior)
- Docker (opcional, para ejecución de la base de datos)

## Configuración

1. Clone el repositorio
2. Instale las dependencias:
```bash
npm install
```
3. Configure el archivo .env (puede copiar y modificar el archivo .env.example)
4. Inicie la base de datos:
```bash
docker-compose up -d
```
5. Inicie la aplicación:
```bash
npm run start:dev
```

## Base de datos

La aplicación utiliza PostgreSQL como base de datos. Para desarrollar localmente, puede usar Docker:

```bash
docker run --name postgres-gad -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=admin123 -e POSTGRES_DB=gad_db -p 5432:5432 -d postgres
```

## Endpoints API

### Autenticación

- `POST /api/auth/registro`: Registra un nuevo usuario
- `POST /api/auth/login`: Inicia sesión y devuelve un token JWT

### Usuarios

- `GET /api/usuarios`: Obtiene todos los usuarios (requiere autenticación)
- `GET /api/usuarios/:id`: Obtiene un usuario por ID
- `POST /api/usuarios`: Crea un nuevo usuario (requiere rol "admin")
- `PUT /api/usuarios/:id`: Actualiza un usuario (requiere rol "admin")
- `DELETE /api/usuarios/:id`: Elimina un usuario (requiere rol "admin")

### Direcciones

- `GET /api/direcciones`: Obtiene todas las direcciones
- `GET /api/direcciones/:id`: Obtiene una dirección específica
- `POST /api/direcciones`: Crea una nueva dirección (requiere rol "admin")
- `PUT /api/direcciones/:id`: Actualiza una dirección (requiere rol "admin")
- `DELETE /api/direcciones/:id`: Elimina una dirección (requiere rol "admin")

### Departamentos

- `GET /api/departamentos`: Obtiene todos los departamentos
- `GET /api/departamentos/:id`: Obtiene un departamento específico
- `POST /api/departamentos`: Crea un nuevo departamento (requiere rol "admin")
- `PUT /api/departamentos/:id`: Actualiza un departamento (requiere rol "admin")
- `DELETE /api/departamentos/:id`: Elimina un departamento (requiere rol "admin")

### Permisos

- `GET /api/permisos`: Obtiene todos los permisos (requiere rol "admin")
- `GET /api/permisos/:id`: Obtiene un permiso específico (requiere rol "admin")
- `GET /api/permisos/usuario/:id`: Obtiene permisos para un usuario específico
- `POST /api/permisos`: Crea un nuevo permiso (requiere rol "admin")
- `PUT /api/permisos/:id`: Actualiza un permiso (requiere rol "admin")
- `DELETE /api/permisos/:id`: Elimina un permiso (requiere rol "admin")

## Modelos de datos

### Usuario
```typescript
{
  id: number;
  nombre: string;
  correo: string;
  password: string; // Encriptada
  rol: string; // 'admin', 'usuario', etc.
  activo: boolean;
  numero_cedula: string;
  fecha_nacimiento: Date;
  fecha_registro: Date;
  fecha_salida: Date;
  celular: string;
  contacto_emergencia: string;
  direccion: Direccion;
  departamento: Departamento;
}
```

### Direccion
```typescript
{
  id: number;
  nombre: string;
  estado: boolean;
  departamentos: Departamento[];
  usuarios: Usuario[];
  permisos: Permiso[];
}
```

### Departamento
```typescript
{
  id: number;
  nombre: string;
  descripcion: string;
  estado: boolean;
  direccion: Direccion; // Relación con dirección
}
```

### Permiso
```typescript
{
  id: number;
  fecha_registro: Date;
  usuario: Usuario;
  direccion: Direccion;
  departamento: Departamento;
  nivel: string; // 'lectura', 'escritura', 'admin'
}
```

## Ejemplos de uso

### Registrar un usuario
```bash
curl -X POST http://localhost:3000/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Admin", "correo":"admin@gadjaramijo.gob.ec", "password":"123456", "rol":"admin"}'
```

### Iniciar sesión
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"admin@gadjaramijo.gob.ec", "password":"123456"}'
```

### Crear una dirección (con token JWT)
```bash
curl -X POST http://localhost:3000/api/direcciones \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TOKEN]" \
  -d '{"nombre":"DIRECCIÓN ADMINISTRATIVA", "estado":true}'
```

### Crear un departamento
```bash
curl -X POST http://localhost:3000/api/departamentos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TOKEN]" \
  -d '{"nombre":"Recursos Humanos", "descripcion":"Gestión del personal", "direccionId":1, "estado":true}'
```

### Asignar un permiso
```bash
curl -X POST http://localhost:3000/api/permisos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TOKEN]" \
  -d '{"usuarioId":1, "direccionId":1, "departamentoId":1, "nivel":"admin"}'
```
