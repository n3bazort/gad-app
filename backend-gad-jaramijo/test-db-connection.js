/**
 * Script para probar la conexión a PostgreSQL
 * Ejecutar con: node test-db-connection.js
 */
const { Client } = require('pg');
require('dotenv').config();

async function testDBConnection() {
  // Usar los valores del archivo .env o valores por defecto
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'admin',
    database: process.env.DB_DATABASE || 'gad_db'
  });

  try {
    console.log('Intentando conectar a PostgreSQL con los siguientes parámetros:');
    console.log(`Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`Puerto: ${process.env.DB_PORT || 5432}`);
    console.log(`Usuario: ${process.env.DB_USERNAME || 'postgres'}`);
    console.log(`Base de datos: ${process.env.DB_DATABASE || 'gad_db'}`);
    
    await client.connect();
    console.log('¡Conexión exitosa a PostgreSQL!');
    
    // Comprobar si la base de datos está vacía o tiene tablas
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('\nTablas encontradas:');
    if (tablesResult.rows.length === 0) {
      console.log('No se encontraron tablas. La base de datos está vacía.');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`- ${row.table_name}`);
      });
    }
    
  } catch (error) {
    console.error('Error de conexión a PostgreSQL:', error);
  } finally {
    await client.end();
  }
}

testDBConnection();
