# Backend GAD Jaramijó

Este es el backend para la aplicación del GAD Municipal de Jaramijó, desarrollado con NestJS y PostgreSQL.

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
</p>

## Estructura organizacional

El sistema está diseñado siguiendo la estructura organizacional del GAD Municipal de Jaramijó:

1. **Direcciones**: Nivel superior de la estructura organizacional (Ej: Dirección Administrativa, Dirección Financiera)
2. **Departamentos**: Unidades que pertenecen a una dirección (Ej: Recursos Humanos pertenece a Dirección Administrativa)
3. **Usuarios**: Personal asignado a departamentos específicos con diferentes niveles de acceso
4. **Permisos**: Control de acceso a recursos específicos por dirección y departamento

## Estructura del proyecto

El proyecto está organizado en varios módulos:

- **Auth**: Autenticación y autorización con JWT
- **Usuarios**: Gestión de usuarios con información personal y pertenencia a departamentos
- **Direcciones**: Gestión de direcciones administrativas (nivel superior de la jerarquía)
- **Departamentos**: Gestión de departamentos pertenecientes a direcciones
- **Permisos**: Gestión de permisos de usuario por departamento y dirección

## Requisitos

- Node.js (v16 o superior)
- npm (v8 o superior)
- PostgreSQL (v12 o superior)
- Docker (opcional, para ejecución de la base de datos)

## Configuración

### Instalación inicial

1. Clone el repositorio:
```bash
git clone https://github.com/nombre-usuario/backend-gad-jaramijo.git
cd backend-gad-jaramijo
```

2. Instale las dependencias:
```bash
npm install
```

3. Configure el archivo .env (copie y modifique el archivo .env.example):
```bash
cp .env.example .env
```

4. Modifique el archivo .env con sus configuraciones:
```
# Configuración de la base de datos
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=admin
DB_PASSWORD=admin123
DB_DATABASE=gad_db

# Configuración de JWT
JWT_SECRET=su_clave_secreta
JWT_EXPIRES_IN=1d

# Configuración del servidor
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Configuración de la base de datos

#### Opción 1: Usando Docker (recomendado)

1. Inicie la base de datos con Docker:
```bash
docker run --name postgres-gad -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=admin123 -e POSTGRES_DB=gad_db -p 5432:5432 -d postgres
```

2. O si tiene un docker-compose.yml:
```bash
docker-compose up -d
```

#### Opción 2: PostgreSQL local

Si ya tiene PostgreSQL instalado en su sistema:

1. Cree una base de datos para el proyecto:
```bash
psql -U postgres
CREATE DATABASE gad_db;
CREATE USER admin WITH ENCRYPTED PASSWORD 'admin123';
GRANT ALL PRIVILEGES ON DATABASE gad_db TO admin;
\q
```

### Iniciar la aplicación

```bash
# Modo desarrollo
npm run start:dev

# Modo producción
npm run build
npm run start:prod
```

La aplicación estará disponible en: http://localhost:3000/api

## Migración de la base de datos

### Sincronización automática (Entorno de desarrollo)

En entornos de desarrollo, TypeORM puede sincronizar automáticamente el esquema de la base de datos con las entidades definidas en el código. Esta opción está habilitada por defecto en el entorno de desarrollo:

```typescript
// app.module.ts
TypeOrmModule.forRootAsync({
  // ...
  synchronize: configService.get('NODE_ENV') !== 'production', // Solo en desarrollo
}),
```

### Migración para entorno de producción

Para entornos de producción, es recomendable usar migraciones explícitas para mantener la integridad de los datos:

1. Generar una migración (después de hacer cambios en las entidades):
```bash
npm run typeorm:generate -- -n NombreMigracion
```

2. Ejecutar las migraciones pendientes:
```bash
npm run typeorm:run
```

### Inicialización de datos de ejemplo

Para crear datos iniciales en la base de datos vacía, puede utilizar los siguientes scripts:

1. Crear direcciones administrativas:
```sql
INSERT INTO direccion (nombre, estado)
VALUES 
('DIRECCIÓN ADMINISTRATIVA', true),
('DIRECCIÓN FINANCIERA', true),
('DIRECCIÓN DE PLANIFICACIÓN', true);
```

2. Crear departamentos asociados a direcciones:
```sql
INSERT INTO departamento (nombre, descripcion, estado, direccion_id)
VALUES 
('RECURSOS HUMANOS', 'Gestión del personal', true, 1),
('COMPRAS PÚBLICAS', 'Gestión de adquisiciones', true, 1),
('CONTABILIDAD', 'Manejo de cuentas y finanzas', true, 2);
```

3. Crear usuarios de prueba:
```sql
INSERT INTO usuario (nombre, correo, password, rol, activo, numero_cedula, fecha_nacimiento, celular, nom_contacto, tel_contacto, direccion_id, departamento_id) 
VALUES 
('Admin Usuario', 'admin@gadjaramijo.gob.ec', '$2b$10$X/QEi3L7W9wYyYBP9f5W4O5tgd5ESQ5pY9Wsf5AnJ80vWmvULxTFK', 'admin', true, '1301234567', '1985-05-10', '0997654321', 'Contacto Admin', '0987654321', 1, 1);
-- La contraseña encriptada corresponde a "123456"
```

4. Crear permisos de ejemplo:
```sql
INSERT INTO permiso (usuario_id, direccion_id, departamento_id, nivel)
VALUES 
(1, 1, 1, 'admin'); -- Asigna permiso de administrador al usuario 1 en RRHH
```

## API Endpoints

### Autenticación

| Método | Ruta | Descripción | Permisos | Datos requeridos |
|--------|------|-------------|----------|-----------------|
| `POST` | `/api/auth/registro` | Registra un nuevo usuario | Público | `nombre`, `correo`, `password` |
| `POST` | `/api/auth/login` | Inicia sesión | Público | `correo`, `password` |

### Usuarios

| Método | Ruta | Descripción | Permisos | Parámetros/Datos |
|--------|------|-------------|----------|-----------------|
| `GET` | `/api/usuarios` | Obtiene todos los usuarios activos | Autenticado | - |
| `GET` | `/api/usuarios/todos` | Obtiene todos los usuarios (incluyendo inactivos) | Admin | - |
| `GET` | `/api/usuarios/:id` | Obtiene un usuario por ID | Autenticado | `id` (path) |
| `POST` | `/api/usuarios` | Crea un nuevo usuario | Admin | `CreateUsuarioDto` |
| `PUT` | `/api/usuarios/:id` | Actualiza un usuario | Admin | `id` (path), `UpdateUsuarioDto` |
| `DELETE` | `/api/usuarios/:id` | Desactiva un usuario (soft delete) | Admin | `id` (path) |

### Direcciones

| Método | Ruta | Descripción | Permisos | Parámetros/Datos |
|--------|------|-------------|----------|-----------------|
| `GET` | `/api/direcciones` | Obtiene todas las direcciones | Autenticado | - |
| `GET` | `/api/direcciones/:id` | Obtiene una dirección específica | Autenticado | `id` (path) |
| `POST` | `/api/direcciones` | Crea una nueva dirección | Admin | `CreateDireccionDto` |
| `PUT` | `/api/direcciones/:id` | Actualiza una dirección | Admin | `id` (path), `UpdateDireccionDto` |
| `DELETE` | `/api/direcciones/:id` | Elimina una dirección | Admin | `id` (path) |

### Departamentos

| Método | Ruta | Descripción | Permisos | Parámetros/Datos |
|--------|------|-------------|----------|-----------------|
| `GET` | `/api/departamentos` | Obtiene todos los departamentos | Autenticado | - |
| `GET` | `/api/departamentos/:id` | Obtiene un departamento específico | Autenticado | `id` (path) |
| `GET` | `/api/departamentos/direccion/:direccionId` | Obtiene departamentos por dirección | Autenticado | `direccionId` (path) |
| `POST` | `/api/departamentos` | Crea un nuevo departamento | Admin | `CreateDepartamentoDto` |
| `PUT` | `/api/departamentos/:id` | Actualiza un departamento | Admin | `id` (path), `UpdateDepartamentoDto` |
| `DELETE` | `/api/departamentos/:id` | Elimina un departamento | Admin | `id` (path) |

### Permisos

| Método | Ruta | Descripción | Permisos | Parámetros/Datos |
|--------|------|-------------|----------|-----------------|
| `GET` | `/api/permisos` | Obtiene todos los permisos | Admin | - |
| `GET` | `/api/permisos/:id` | Obtiene un permiso específico | Admin | `id` (path) |
| `GET` | `/api/permisos/usuario/:id` | Obtiene permisos de un usuario | Admin o propietario | `id` (path) |
| `POST` | `/api/permisos` | Crea un nuevo permiso | Admin | `CreatePermisoDto` |
| `PUT` | `/api/permisos/:id` | Actualiza un permiso | Admin | `id` (path), `UpdatePermisoDto` |
| `DELETE` | `/api/permisos/:id` | Elimina un permiso | Admin | `id` (path) |

## Modelos de datos

### Estructura de entidades

La aplicación utiliza el siguiente modelo de datos con relaciones entre entidades:

![Diagrama de Entidades](https://mermaid.ink/img/pako:eNqNksFqwzAMhl_F6NRBs7dIYWMwdoeyQeGwo-vDnDq0xo2DnXQbY---OEtSWunWi2X9-vT_QsqVNlFpLTL-tE45aG0CdDYYcrfGOk_j1YndEwws5YqtZAEciWNY3Rw_Ebw-CSAqPLGvsNZzqDl0j-SDuGcni1OiFFaw8UNqwlFQcOxyq80JlgK8N0ZrZ4uGPdFg2YEsLsDAsdIpSvc2ZNpCDTUEslBzqjwy8YpUwxmkXPsqFfM_VZXPZzZh9MrMYJXDj8fxdJJl2dRcrGLWG_lv7h9oMzR6csxQtYPmmbvRX12vjdE0KnWOsP9VHR73wYvmNUSzChq7yYvyPR9Jbdco3iyfF3mR5-JnE4NdF_ls3G6OppvKu1UVehJVZl_LohT5chwm75w1HgJZOvz_BfPCvQE?type=png)

### Usuario
```typescript
{
  id: number;
  nombre: string;
  correo: string; // Único
  password: string; // Encriptada
  rol: string; // 'admin', 'usuario', etc.
  activo: boolean; // Permite "soft delete"
  numero_cedula: string; // Único
  fecha_nacimiento: Date;
  fecha_registro: Date; // Automático, timestamp actual
  fecha_salida: Date; // Opcional, para usuarios que salen
  celular: string;
  nom_contacto: string; // Nombre del contacto de emergencia
  tel_contacto: string; // Teléfono del contacto de emergencia
  direccion: Direccion; // Relación ManyToOne
  departamento: Departamento; // Relación ManyToOne
  permisos: Permiso[]; // Relación OneToMany
}
```

### Direccion (Nivel superior en jerarquía)
```typescript
{
  id: number;
  nombre: string; // Ej: "DIRECCIÓN ADMINISTRATIVA"
  estado: boolean; // Activo/Inactivo
  departamentos: Departamento[]; // Relación OneToMany
  usuarios: Usuario[]; // Relación OneToMany
  permisos: Permiso[]; // Relación OneToMany
}
```

### Departamento (Pertenece a una dirección)
```typescript
{
  id: number;
  nombre: string; // Ej: "Recursos Humanos"
  descripcion: string; // Opcional
  estado: boolean; // Activo/Inactivo
  direccion: Direccion; // Relación ManyToOne
  usuarios: Usuario[]; // Relación OneToMany
  permisos: Permiso[]; // Relación OneToMany
}
```

### Permiso (Relaciona usuario, dirección y departamento)
```typescript
{
  id: number;
  fecha_registro: Date; // Automático
  usuario: Usuario; // Relación ManyToOne
  direccion: Direccion; // Relación ManyToOne
  departamento: Departamento; // Relación ManyToOne
  nivel: string; // Enum: 'lectura', 'escritura', 'admin'
}
```

### Restricciones de integridad

- Un departamento debe pertenecer a una dirección
- Un usuario debe estar asignado a un departamento y dirección
- Al asignar un usuario a un departamento, este debe pertenecer a la dirección asignada
- Un permiso requiere un usuario, departamento y dirección, y el departamento debe pertenecer a la dirección
- No se permite eliminar direcciones con departamentos asociados
- No se permite eliminar departamentos con usuarios asociados
- La eliminación de usuarios es lógica (soft delete) mediante el campo `activo`
- La eliminación de un usuario elimina en cascada sus permisos

## Ejemplos de uso

### Autenticación

#### Registrar un usuario
```bash
curl -X POST http://localhost:3000/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Admin",
    "correo": "admin@gadjaramijo.gob.ec",
    "password": "123456",
    "rol": "admin",
    "numero_cedula": "1309876543",
    "fecha_nacimiento": "1980-01-01",
    "celular": "0991234567",
    "direccionId": 1,
    "departamentoId": 1
  }'
```

#### Iniciar sesión
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"admin@gadjaramijo.gob.ec", "password":"123456"}'
```

### Gestión de direcciones

#### Crear una dirección
```bash
curl -X POST http://localhost:3000/api/direcciones \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TOKEN]" \
  -d '{"nombre":"DIRECCIÓN ADMINISTRATIVA", "estado":true}'
```

#### Listar todas las direcciones
```bash
curl -X GET http://localhost:3000/api/direcciones \
  -H "Authorization: Bearer [TOKEN]"
```

#### Actualizar una dirección
```bash
curl -X PUT http://localhost:3000/api/direcciones/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TOKEN]" \
  -d '{"nombre":"DIRECCIÓN ADMINISTRATIVA Y TALENTO HUMANO"}'
```

### Gestión de departamentos

#### Crear un departamento
```bash
curl -X POST http://localhost:3000/api/departamentos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TOKEN]" \
  -d '{
    "nombre": "Recursos Humanos",
    "descripcion": "Gestión del personal",
    "direccionId": 1,
    "estado": true
  }'
```

#### Obtener departamentos de una dirección
```bash
curl -X GET http://localhost:3000/api/departamentos/direccion/1 \
  -H "Authorization: Bearer [TOKEN]"
```

### Gestión de usuarios

#### Crear un usuario
```bash
curl -X POST http://localhost:3000/api/usuarios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TOKEN]" \
  -d '{
    "nombre": "Juan Pérez",
    "correo": "jperez@gadjaramijo.gob.ec",
    "password": "123456",
    "rol": "usuario",
    "numero_cedula": "1308765432",
    "fecha_nacimiento": "1985-05-15",
    "celular": "0997654321",
    "nom_contacto": "María Pérez",
    "tel_contacto": "0981234567",
    "direccionId": 1,
    "departamentoId": 1
  }'
```

#### Listar usuarios (incluyendo inactivos)
```bash
curl -X GET http://localhost:3000/api/usuarios/todos \
  -H "Authorization: Bearer [TOKEN]"
```

#### Actualizar un usuario
```bash
curl -X PUT http://localhost:3000/api/usuarios/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TOKEN]" \
  -d '{
    "celular": "0997654322",
    "departamentoId": 2
  }'
```

### Gestión de permisos

#### Asignar un permiso
```bash
curl -X POST http://localhost:3000/api/permisos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TOKEN]" \
  -d '{
    "usuarioId": 1,
    "direccionId": 1,
    "departamentoId": 1,
    "nivel": "admin"
  }'
```

#### Obtener permisos de un usuario
```bash
curl -X GET http://localhost:3000/api/permisos/usuario/1 \
  -H "Authorization: Bearer [TOKEN]"
```

#### Actualizar un permiso
```bash
curl -X PUT http://localhost:3000/api/permisos/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TOKEN]" \
  -d '{"nivel": "escritura"}'
```

## Implementación de la estructura organizacional

### Cambios realizados

La implementación de la nueva estructura organizacional incluyó los siguientes cambios:

1. **Nuevo modelo jerárquico**: 
   - Se implementó un modelo jerárquico con Direcciones en el nivel superior y Departamentos como subdivisiones
   - Se eliminó la jerarquía dentro de los departamentos (antes había departamentos con subdepartamentos)

2. **Gestión de usuarios**:
   - Se refactorizó el sistema de usuarios para mejorar la gestión de información personal
   - Se agregaron campos para contacto de emergencia: `nom_contacto` y `tel_contacto`
   - Se implementó "soft delete" para mantener registros históricos

3. **Sistema de permisos**:
   - Se creó un nuevo modelo de permisos con niveles específicos (lectura, escritura, admin)
   - Los permisos ahora están asociados a la combinación de usuario, dirección y departamento
   - Se reemplazó la entidad PermisosUsuarioDepartamento por la nueva entidad Permiso

4. **Validaciones**:
   - Se agregaron validaciones para mantener la integridad de la estructura organizacional
   - Se verifica que los departamentos pertenezcan a las direcciones indicadas
   - Se controlan las asignaciones de usuarios a departamentos según la estructura jerárquica

### Consideraciones para producción

1. **Migración de datos**:
   - Ejecutar los scripts de migración en el orden correcto: primero direcciones, luego departamentos, etc.
   - Verificar la integridad de datos después de cada migración
   - Realizar respaldos antes de cada fase de migración

2. **Despliegue**:
   - Configurar el entorno de producción con `NODE_ENV=production` para desactivar la sincronización automática
   - Utilizar migraciones explícitas con TypeORM para actualizaciones de esquema
   - Configurar seguridad adecuada para la base de datos de producción

3. **Seguridad**:
   - Generar un JWT_SECRET robusto para el entorno de producción
   - Configurar CORS para permitir solo los orígenes autorizados
   - Implementar políticas de contraseñas seguras para los usuarios

## Licencia

Este proyecto está licenciado bajo los términos de la licencia MIT.
