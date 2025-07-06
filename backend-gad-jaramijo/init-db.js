/**
 * Script para inicializar la base de datos con datos de prueba
 * Ejecutar con: node init-db.js
 */
const { Client } = require('pg');
require('dotenv').config();

async function initDB() {  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'admin',
    database: process.env.DB_DATABASE || 'gad_db'
  });
  try {
    await client.connect();
    console.log('Conectado a PostgreSQL');

    // Verificar las tablas existentes
    console.log('Verificando tablas existentes...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    if (tablesResult.rows.length === 0) {
      console.log('No se encontraron tablas. Es necesario iniciar la aplicación NestJS primero para que se creen las tablas.');
      return;
    } else {
      console.log('Tablas encontradas:');
      tablesResult.rows.forEach(row => {
        console.log(`- ${row.table_name}`);
      });
    }

    // Verificar columnas de la tabla departamento
    console.log('\nVerificando columnas de la tabla departamento...');
    const departamentoColumnsResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'departamento' AND table_schema = 'public'
    `);

    console.log('Columnas de la tabla departamento:');
    departamentoColumnsResult.rows.forEach(row => {
      console.log(`- ${row.column_name}`);
    });

    // 1. Crear direcciones
    console.log('\nCreando direcciones...');
    await client.query(`
      INSERT INTO direccion (nombre, estado)
      VALUES 
      ('DIRECCIÓN ADMINISTRATIVA', true),
      ('DIRECCIÓN FINANCIERA', true),
      ('DIRECCIÓN DE PLANIFICACIÓN', true)
      ON CONFLICT (id) DO NOTHING;
    `);
    
    // 2. Crear departamentos - Verificar el nombre real de la columna de relación
    console.log('Creando departamentos...');
    
    // Determinar el nombre correcto de la columna de relación con direccion
    let direccionRelationColumn = 'direccion_id'; // Nombre por defecto
    
    // Buscar si existe otra columna para la relación (direccionId)
    if (!departamentoColumnsResult.rows.find(row => row.column_name === 'direccion_id')) {
      if (departamentoColumnsResult.rows.find(row => row.column_name === 'direccionid')) {
        direccionRelationColumn = 'direccionid';
      }
    }
    
    console.log(`Usando columna de relación: ${direccionRelationColumn}`);
    
    await client.query(`
      INSERT INTO departamento (nombre, descripcion, estado, ${direccionRelationColumn})
      VALUES 
      ('RECURSOS HUMANOS', 'Gestión del personal', true, 1),
      ('COMPRAS PÚBLICAS', 'Gestión de adquisiciones', true, 1),
      ('CONTABILIDAD', 'Manejo de cuentas y finanzas', true, 2),
      ('PRESUPUESTO', 'Control de presupuesto anual', true, 2),
      ('DESARROLLO URBANO', 'Planificación de la ciudad', true, 3)
      ON CONFLICT (id) DO NOTHING;
    `);    // Verificar columnas de la tabla usuario
    console.log('\nVerificando columnas de la tabla usuario...');
    const usuarioColumnsResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'usuario' AND table_schema = 'public'
    `);

    console.log('Columnas de la tabla usuario:');
    usuarioColumnsResult.rows.forEach(row => {
      console.log(`- ${row.column_name}`);
    });
    
    // Determinar nombres correctos de columnas para relaciones
    let direccionColumnUsuario = 'direccion_id';
    let departamentoColumnUsuario = 'departamento_id';
    let nomContactoColumn = 'nom_contacto_emerg';
    let telContactoColumn = 'tel_contacto_emerg';
    
    // Buscar los nombres reales de las columnas
    if (!usuarioColumnsResult.rows.find(row => row.column_name === 'direccion_id')) {
      if (usuarioColumnsResult.rows.find(row => row.column_name === 'direccionid')) {
        direccionColumnUsuario = 'direccionid';
      }
    }
    
    if (!usuarioColumnsResult.rows.find(row => row.column_name === 'departamento_id')) {
      if (usuarioColumnsResult.rows.find(row => row.column_name === 'departamentoid')) {
        departamentoColumnUsuario = 'departamentoid';
      }
    }
    
    // Verificar si los campos de contacto tienen el sufijo _emerg
    if (!usuarioColumnsResult.rows.find(row => row.column_name === 'nom_contacto_emerg')) {
      if (usuarioColumnsResult.rows.find(row => row.column_name === 'nom_contacto')) {
        nomContactoColumn = 'nom_contacto';
      }
    }
    
    if (!usuarioColumnsResult.rows.find(row => row.column_name === 'tel_contacto_emerg')) {
      if (usuarioColumnsResult.rows.find(row => row.column_name === 'tel_contacto')) {
        telContactoColumn = 'tel_contacto';
      }
    }
    
    // 3. Crear usuario administrador
    console.log(`\nCreando usuario administrador con columnas: direccion=${direccionColumnUsuario}, departamento=${departamentoColumnUsuario}`);
    console.log(`Campos de contacto: nombre=${nomContactoColumn}, telefono=${telContactoColumn}`);
    
    // La contraseña es '123456' hasheada
    const insertUsuarioQuery = `
      INSERT INTO usuario (
        nombre, correo, password, rol, activo, 
        numero_cedula, fecha_nacimiento, celular, 
        ${nomContactoColumn}, ${telContactoColumn},
        ${direccionColumnUsuario}, ${departamentoColumnUsuario}
      )
      VALUES (
        'Admin Usuario', 
        'admin@gadjaramijo.gob.ec', 
        '$2b$10$X/QEi3L7W9wYyYBP9f5W4O5tgd5ESQ5pY9Wsf5AnJ80vWmvULxTFK', 
        'admin', 
        true, 
        '1301234567', 
        '1985-05-10', 
        '0997654321',
        'Contacto de Emergencia',
        '0987654321', 
        1, 
        1
      )
      ON CONFLICT (correo) DO NOTHING;
    `;
    
    await client.query(insertUsuarioQuery);

    console.log('Base de datos inicializada con éxito');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
  } finally {
    await client.end();
    console.log('Conexión cerrada');
  }
}

initDB();
