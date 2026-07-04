# CECOM Pagos - Backend (API)

Este repositorio contiene la lógica del backend (API REST) para el Sistema de Pagos y Tesorería, desarrollado con **NestJS** y **Prisma ORM**.
Se encarga del procesamiento de datos de Excel, autenticación y de la generación de documentos Word y PDF (Declaraciones Juradas y CCI).

## Requisitos previos
- Node.js (v18 o superior)
- PostgreSQL (Tener una base de datos creada, por ejemplo `pagos_db`)
- Python (Para la conversión de Word a PDF, y tener instalada la librería `docx2pdf` y `comtypes` en Windows).

## Instalación

1. Clona este repositorio y entra en la carpeta:
```bash
git clone <tu-url-del-repo-backend>
cd cecom-pagos-api
```

2. Instala las dependencias:
```bash
npm install
```

## Variables de Entorno (.env)
Este repositorio NO incluye el archivo `.env` por seguridad. Debes crear un archivo llamado `.env` en la raíz del proyecto (a la misma altura que `package.json`) con las siguientes variables:

```env
# URL de conexión a tu base de datos PostgreSQL
DATABASE_URL="postgresql://<TU_USUARIO>:<TU_CONTRASEÑA>@localhost:5432/pagos_db?schema=public"

# Clave secreta para JWT (puedes poner cualquier texto largo o generado)
JWT_SECRET="MiClaveSecretaSuperSegura2026"
```

## Configuración de la Base de Datos

Una vez configurado tu `.env`, debes sincronizar la estructura con tu base de datos corriendo:

```bash
npx prisma db push
```

*(Opcional: Si necesitas abrir el administrador gráfico de la base de datos puedes ejecutar `npx prisma studio`)*

## Ejecutar el Servidor

Para levantar el servidor en modo desarrollo (se actualiza solo ante cambios):
```bash
npm run start:dev
```
El servidor backend correrá en `http://localhost:3001`.

## Scripts Útiles
- `npm run build`: Construye el proyecto para producción.
- `npm run start:prod`: Inicia el servidor construido (producción).
