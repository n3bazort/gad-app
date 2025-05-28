## 🐳 Base de datos con Docker (PostgreSQL)

Este proyecto usa una base de datos PostgreSQL montada en un contenedor Docker.

### Comando para levantar el contenedor:

```bash
docker run --name postgres-gad -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=admin123 -e POSTGRES_DB=gad_db -p 5432:5432 -d postgres
