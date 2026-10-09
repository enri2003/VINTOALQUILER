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

## Metodología: XP adaptado a un desarrollador individual

El desarrollo se organizó en 7 iteraciones XP. Cada iteración tiene su rama en el repositorio.

| Iteración | Rama |
|---|---|
| 1. Autenticación y verificación de identidad | `iteracion-1-autenticacion-verificacion` |
| 2. Publicación, búsqueda y mapa | `iteracion-2-publicacion-busqueda-mapa` |
| 3. Contacto, favoritos y alertas | `iteracion-3-contacto-favoritos-alertas` |
| 4. Impulso y administración | `iteracion-4-impulso-administracion` |
| 5. Detección temprana de riesgo | `iteracion-5-deteccion-riesgo` |
| 6. Recomendación personalizada | `iteracion-6-recomendacion` |
| 7. Observatorio de mercado (ODMH-Vinto) | `iteracion-7-observatorio` |

**Nota de trazabilidad:** la base técnica del sistema se creó el 17/08/2026 en commits titulados "Módulo 1" a "Módulo 9", que luego se organizaron y completaron en las 7 iteraciones de la tabla. Dos decisiones iniciales se reemplazaron durante el desarrollo:

- El mapa con Leaflet se reemplazó por MapLibre GL JS.
- Los planes gratuito y Pro con límite de anuncios se reemplazaron por el modelo de Impulso: anuncios sin límite y más fotos y visibilidad con Impulso de 7, 15 o 30 días.

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

### Pruebas unitarias (backend)
```
cd backend
npm test            # 42 pruebas con Jest: autenticación, verificación de identidad y detección de riesgo
npm run test:cov    # con reporte de cobertura
```

## Documentación técnica

- [Diagrama y diccionario de datos](./docs/diccionario-datos.md)
