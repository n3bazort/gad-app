// datos-prueba.js - Script para generar datos de prueba en la base de datos del GAD Jaramijó

const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const faker = require('faker');

// Configuración para español
faker.locale = 'es';

// Configuración de conexión a la base de datos
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'gad_db',
  password: 'admin',
  port: 5432,
});

// Parámetros de configuración
const NUM_DIRECCIONES = 5;
const NUM_DEPARTAMENTOS_POR_DIRECCION = 3;
const NUM_USUARIOS_POR_DEPARTAMENTO = 3;
const PASSWORD_HASH = '$2b$10$X/QEi3L7W9wYyYBP9f5W4O5tgd5ESQ5pY9Wsf5AnJ80vWmvULxTFK'; // '123456' encriptado
const NIVELES_PERMISO = ['lectura', 'escritura', 'admin'];
const ROLES_USUARIO = ['admin', 'usuario', 'supervisor'];

// Arrays para almacenar los IDs generados
const direccionIds = [];
const departamentoIds = [];
const usuarioIds = [];

// Función para generar nombre de dirección
function generarNombreDireccion() {
  const areas = [
    'ADMINISTRATIVA', 'FINANCIERA', 'PLANIFICACIÓN', 'OBRAS PÚBLICAS', 
    'DESARROLLO SOCIAL', 'TURISMO', 'AMBIENTE', 'CULTURA',
    'COMUNICACIÓN', 'TALENTO HUMANO'
  ];
  return `DIRECCIÓN ${areas[Math.floor(Math.random() * areas.length)]}`;
}

// Función para generar nombre de departamento
function generarNombreDepartamento() {
  const departamentos = [
    'RECURSOS HUMANOS', 'CONTABILIDAD', 'TESORERÍA', 'SISTEMAS', 
    'COMPRAS PÚBLICAS', 'PROYECTOS', 'LEGAL', 'ATENCIÓN CIUDADANA',
    'GESTIÓN DOCUMENTAL', 'FISCALIZACIÓN', 'MANTENIMIENTO'
  ];
  return departamentos[Math.floor(Math.random() * departamentos.length)];
}

// Función para generar una cédula ecuatoriana válida
function generarCedula() {
  let cedula = '';
  for (let i = 0; i < 10; i++) {
    cedula += Math.floor(Math.random() * 10);
  }
  return cedula;
}

// Función para generar todos los datos de prueba
async function generarDatos() {
  try {
    console.log('Iniciando generación de datos de prueba...');
    
    // Crear direcciones
    console.log('\n--- CREANDO DIRECCIONES ---');
    for (let i = 0; i < NUM_DIRECCIONES; i++) {
      const nombre = generarNombreDireccion();
      const query = 'INSERT INTO direccion (nombre, estado) VALUES ($1, $2) RETURNING id';
      const result = await pool.query(query, [nombre, true]);
      const id = result.rows[0].id;
      direccionIds.push(id);
      console.log(`✓ Dirección creada: "${nombre}" (ID: ${id})`);
    }
    
    // Crear departamentos
    console.log('\n--- CREANDO DEPARTAMENTOS ---');
    for (const direccionId of direccionIds) {
      for (let i = 0; i < NUM_DEPARTAMENTOS_POR_DIRECCION; i++) {
        const nombre = generarNombreDepartamento();
        const descripcion = faker.lorem.sentence();
        const query = 'INSERT INTO departamento (nombre, descripcion, estado, direccion_id) VALUES ($1, $2, $3, $4) RETURNING id';
        const result = await pool.query(query, [nombre, descripcion, true, direccionId]);
        const id = result.rows[0].id;
        departamentoIds.push({id, direccionId});
        console.log(`✓ Departamento creado: "${nombre}" (ID: ${id}, Dirección ID: ${direccionId})`);
      }
    }
    
    // Crear usuarios
    console.log('\n--- CREANDO USUARIOS ---');
    for (const depto of departamentoIds) {
      for (let i = 0; i < NUM_USUARIOS_POR_DEPARTAMENTO; i++) {
        const nombre = faker.name.findName();
        const correo = faker.internet.email().toLowerCase();
        const rol = ROLES_USUARIO[Math.floor(Math.random() * ROLES_USUARIO.length)];
        const numero_cedula = generarCedula();
        const fecha_nacimiento = faker.date.past(40).toISOString().split('T')[0];
        const fecha_registro = new Date().toISOString();
        const celular = `09${Math.floor(Math.random() * 90000000) + 10000000}`;
        const nom_contacto_emerg = faker.name.findName();
        const tel_contacto_emerg = `09${Math.floor(Math.random() * 90000000) + 10000000}`;
        
        const query = `
          INSERT INTO usuario 
          (nombre, correo, password, rol, activo, numero_cedula, fecha_nacimiento, fecha_registro, celular, nom_contacto_emerg, tel_contacto_emerg, direccion_id, departamento_id) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id
        `;
          const result = await pool.query(query, [
          nombre, correo, PASSWORD_HASH, rol, true, numero_cedula, 
          fecha_nacimiento, fecha_registro, celular, nom_contacto_emerg, tel_contacto_emerg, 
          depto.direccionId, depto.id
        ]);
        
        const id = result.rows[0].id;
        usuarioIds.push({id, direccionId: depto.direccionId, departamentoId: depto.id});
        console.log(`✓ Usuario creado: "${nombre}" (${correo}, ID: ${id})`);
      }
    }
    
    // Crear permisos
    console.log('\n--- CREANDO PERMISOS ---');
    for (const usuario of usuarioIds) {
      // Conseguir departamentos de la misma dirección
      const deptosMismaDireccion = departamentoIds.filter(d => d.direccionId === usuario.direccionId);
      
      // Crear de 1 a 3 permisos por usuario
      const numPermisos = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < numPermisos; i++) {
        // Seleccionar un departamento aleatorio de la misma dirección
        const depto = deptosMismaDireccion[Math.floor(Math.random() * deptosMismaDireccion.length)];
        const nivel = NIVELES_PERMISO[Math.floor(Math.random() * NIVELES_PERMISO.length)];
        
        // Verificar si ya existe este permiso para evitar duplicados
        const checkQuery = `
          SELECT id FROM permiso 
          WHERE usuario_id = $1 AND direccion_id = $2 AND departamento_id = $3
        `;
        const checkResult = await pool.query(checkQuery, [usuario.id, usuario.direccionId, depto.id]);
        
        if (checkResult.rows.length === 0) {
          const query = `
            INSERT INTO permiso
            (usuario_id, direccion_id, departamento_id, nivel)
            VALUES ($1, $2, $3, $4)
          `;
          await pool.query(query, [usuario.id, usuario.direccionId, depto.id, nivel]);
          console.log(`✓ Permiso creado: Usuario ID ${usuario.id} - Nivel ${nivel} - Departamento ID ${depto.id}`);
        }
      }
    }
    
    console.log('\n¡Generación de datos de prueba completada con éxito!');
    console.log(`✓ ${direccionIds.length} direcciones creadas`);
    console.log(`✓ ${departamentoIds.length} departamentos creados`);
    console.log(`✓ ${usuarioIds.length} usuarios creados`);
    
  } catch (error) {
    console.error('Error durante la generación de datos:', error);
  } finally {
    pool.end();
  }
}

// Ejecutar el script
generarDatos();




/* ## Script para Generación de Datos de Prueba

Para facilitar las pruebas del sistema, se ha desarrollado un script que genera datos aleatorios para todas las entidades:

```javascript
// datos-prueba.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
const faker = require('faker');
faker.locale = 'es';

// Configuración
const CANTIDAD_DIRECCIONES = 5;
const DEPARTAMENTOS_POR_DIRECCION = 3;
const USUARIOS_POR_DEPARTAMENTO = 4;
const PERMISOS_POR_USUARIO = 2;
const PASSWORD_HASH = '$2b$10$X/QEi3L7W9wYyYBP9f5W4O5tgd5ESQ5pY9Wsf5AnJ80vWmvULxTFK'; // '123456' encriptado

async function main() {
  console.log('Iniciando generación de datos de prueba...');

  // Crear direcciones
  const direcciones = [];
  for (let i = 0; i < CANTIDAD_DIRECCIONES; i++) {
    const direccion = await prisma.direccion.create({
      data: {
        nombre: `DIRECCIÓN DE ${faker.company.department().toUpperCase()}`,
        estado: true
      }
    });
    direcciones.push(direccion);
    console.log(`Dirección creada: ${direccion.nombre}`);
  }

  // Crear departamentos para cada dirección
  const departamentos = [];
  for (const direccion of direcciones) {
    for (let i = 0; i < DEPARTAMENTOS_POR_DIRECCION; i++) {
      const departamento = await prisma.departamento.create({
        data: {
          nombre: faker.commerce.department().toUpperCase(),
          descripcion: faker.lorem.sentence(),
          estado: true,
          direccion: { connect: { id: direccion.id } }
        }
      });
      departamentos.push(departamento);
      console.log(`Departamento creado: ${departamento.nombre} (Dirección: ${direccion.nombre})`);
    }
  }

  // Crear usuarios para cada departamento
  const usuarios = [];
  const roles = ['admin', 'usuario'];
  
  for (const departamento of departamentos) {
    const direccion = direcciones.find(d => d.id === departamento.direccionId);
    for (let i = 0; i < USUARIOS_POR_DEPARTAMENTO; i++) {
      const nombre = faker.name.findName();
      const correo = faker.internet.email().toLowerCase();
      const rol = roles[Math.floor(Math.random() * roles.length)];
      
      const usuario = await prisma.usuario.create({
        data: {
          nombre,
          correo,
          password: PASSWORD_HASH,
          rol,
          activo: true,
          numero_cedula: faker.random.number({min: 1000000000, max: 9999999999}).toString(),
          fecha_nacimiento: faker.date.past(50),
          celular: faker.phone.phoneNumber('09########'),
          nom_contacto: faker.name.findName(),
          tel_contacto: faker.phone.phoneNumber('09########'),
          direccion: { connect: { id: direccion.id } },
          departamento: { connect: { id: departamento.id } }
        }
      });
      usuarios.push(usuario);
      console.log(`Usuario creado: ${usuario.nombre} (${usuario.correo})`);
    }
  }

  // Crear permisos para usuarios
  for (const usuario of usuarios) {
    // Obtener departamentos de la misma dirección del usuario
    const departamentosDisponibles = departamentos.filter(d => d.direccionId === usuario.direccionId);
    
    // Asignar permisos aleatorios
    const permisosCreados = new Set(); // Para evitar duplicados
    for (let i = 0; i < PERMISOS_POR_USUARIO; i++) {
      const departamento = departamentosDisponibles[Math.floor(Math.random() * departamentosDisponibles.length)];
      const niveles = ['lectura', 'escritura', 'admin'];
      const nivel = niveles[Math.floor(Math.random() * niveles.length)];
      
      // Evitar permisos duplicados para la misma combinación usuario-departamento-dirección
      const permisoKey = `${usuario.id}-${usuario.direccionId}-${departamento.id}`;
      if (!permisosCreados.has(permisoKey)) {
        await prisma.permiso.create({
          data: {
            usuario: { connect: { id: usuario.id } },
            direccion: { connect: { id: usuario.direccionId } },
            departamento: { connect: { id: departamento.id } },
            nivel
          }
        });
        permisosCreados.add(permisoKey);
        console.log(`Permiso creado: Usuario ${usuario.nombre} - Nivel ${nivel} - Departamento ${departamento.nombre}`);
      }
    }
  }

  console.log('Generación de datos de prueba completada con éxito.');
}

main()
  .catch(e => {
    console.error('Error durante la generación de datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Instrucciones para ejecutar el script

1. Instalar las dependencias necesarias:
```bash
npm install @prisma/client bcrypt faker
```

2. Ejecutar el script:
```bash
node datos-prueba.js
```
 */