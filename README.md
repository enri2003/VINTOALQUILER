# VintoAlquiler

Implementación de una plataforma web con APIs de inteligencia artificial para la gestión segura y análisis del mercado de alquileres habitacionales en el municipio de Vinto, incorporando verificación automática de identidad, detección temprana de anuncios de riesgo y análisis estructurado del mercado habitacional.

**Autor:** Elger Enrique Marquez Arze ([@enri2003](https://github.com/enri2003))
**Proyecto de grado** — Ingeniería de Sistemas, Universidad Adventista de Bolivia

## Stack tecnológico

- **Frontend:** Angular + TypeScript
- **Backend:** NestJS + TypeScript
- **Base de datos:** PostgreSQL (TypeORM)
- **Verificación de identidad:** Amazon Rekognition (comparación facial) + Amazon Textract (OCR de CI)
- **Mapa:** OpenStreetMap + MapLibre GL JS
- **Almacenamiento de fotos:** Cloudflare R2

## Estructura del repositorio

```
backend/    API REST en NestJS
frontend/   Aplicación Angular
docs/       Diagrama y diccionario de datos
```

## Cómo correr el proyecto localmente

### Backend
```
cd backend
npm install
cp .env.example .env   # completar variables (BD, AWS, JWT, etc.)
npm run start:dev
```

### Frontend
```
cd frontend
npm install
npm start
```

## Documentación técnica

- [Diagrama y diccionario de datos](./docs/diccionario-datos.md)
