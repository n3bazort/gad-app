# Backend GAD Jaramijó

Este es el backend para la aplicación del GAD Municipal de Jaramijó, desarrollado con NestJS y PostgreSQL.

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
</p>

## Estructura del proyecto

El proyecto está organizado en varios módulos:

- **Auth**: Autenticación y autorización con JWT
- **Usuarios**: Gestión de usuarios
- **Departamentos**: Gestión de departamentos y subdepartamentos
- **Permisos**: Gestión de permisos de usuario por departamento

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

### Departamentos

- `GET /api/departamentos`: Obtiene todos los departamentos
- `GET /api/departamentos/:id`: Obtiene un departamento específico con sus subdepartamentos
- `GET /api/departamentos/jerarquia/completa`: Obtiene la jerarquía completa de departamentos
- `POST /api/departamentos`: Crea un nuevo departamento (requiere rol "admin")
- `PUT /api/departamentos/:id`: Actualiza un departamento (requiere rol "admin")
- `DELETE /api/departamentos/:id`: Elimina un departamento (requiere rol "admin")

### Permisos

- `GET /api/permisos`: Obtiene todos los permisos
- `GET /api/permisos/usuario/:id`: Obtiene permisos para un usuario específico
- `POST /api/permisos`: Asigna un nuevo permiso
- `DELETE /api/permisos/:id`: Elimina un permiso

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
}
```

### Departamento
```typescript
{
  id: number;
  nombre: string;
  descripcion: string;
  padre?: Departamento; // Relación jerárquica
  subdepartamentos?: Departamento[];
}
```

### Permiso
```typescript
{
  id: number;
  usuario: Usuario;
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

### Crear un departamento (con token JWT)
```bash
curl -X POST http://localhost:3000/api/departamentos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TOKEN]" \
  -d '{"nombre":"DIRECCIÓN FINANCIERA", "descripcion":"Gestión presupuestaria y contable"}'
```

### Crear un subdepartamento
```bash
curl -X POST http://localhost:3000/api/departamentos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TOKEN]" \
  -d '{"nombre":"Presupuesto", "descripcion":"Área de presupuesto", "padreId":1}'
```
