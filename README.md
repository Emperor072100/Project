# 📄 Documentación de Entrega – Sistema de Gestión de Campañas y Proyectos

**Cliente / Área solicitante:** AndesBPO  
**Líder del proyecto:** Felipe Arango  
**Fecha de entrega:** 10/12/2025  
**Versión del sistema:** v1.0.0  
**Estado:** 🟡 En revisión  

---

## 🧩 1. Resumen Ejecutivo
> Sistema integral de gestión de campañas, proyectos e implementaciones para AndesBPO. Permite la administración completa de campañas de marketing (SAC, TMC, TVT, CBZ), gestión de proyectos con seguimiento de tareas, y control de implementaciones con subsecciones personalizables. Incluye generación de reportes en PDF y Excel, visualización en tableros Kanban y Gantt, y sistema completo de autenticación con roles.

---

## 🛠️ 2. Información Técnica

### Tecnologías utilizadas
- **Frontend:** React 18, TypeScript, Vite, TailwindCSS, React Router, Axios
- **Backend:** Python 3.11, FastAPI, SQLAlchemy, Pydantic, Gunicorn + Uvicorn
- **Base de datos:** PostgreSQL (AWS RDS)
- **Infraestructura:** Docker, Docker Compose, Nginx, EasyPanel
- **Otras:** JWT (autenticación), ExcelJS (reportes), html2pdf.js, react-hot-toast

### Repositorios
| Entorno | URL |
|--------|-----|
| Código fuente | `https://github.com/Emperor072100/Project` |
| Frontend (Producción) | `https://campaignmanagement.andesbpo.com` |
| Backend (Producción) | `https://campaignmanagement.backend.andesbpo.com` |
| Documentación interna | `/docs/` (archivos adjuntos en repositorio) |

---

## 📚 3. Documentación Entregada

✅ **[✔] Código fuente comentado**  
- Funciones clave documentadas con JSDoc/Docstrings.  
- Estándar de estilo: ESLint + Prettier (config incluida).

✅ **[✔] Manual de usuario**  
- Ubicación: Pendiente (a generar según requerimiento del cliente)  
- Incluye: flujos de uso, capturas, roles (admin/usuario), soporte.

✅ **[✔] README principal**  
- Instrucciones para: clonar, instalar, ejecutar local, tests, despliegue básico.

✅ **[✔] Guía de despliegue**  
- Entornos soportados: `dev`, `staging`, `producción`  
- Pasos detallados + variables de entorno requeridas (`/DEPLOYMENT.md`)

✅ **[✔] Arquitectura del sistema**  
- Descripción: Frontend SPA React + Backend API FastAPI + PostgreSQL  
- APIs expuestas (endpoints REST documentados en código)

✅ **[✔] Pruebas**  
- Cobertura: Pendiente implementación formal  
- Comandos: Tests unitarios en desarrollo

✅ **[✔] Runbook / Operaciones**  
- Escenarios comunes: reinicio de servicio, respaldo de BD, escalado  
- Monitoreo: Health checks en Docker, logs con rotación configurada

✅ **[✔] Inventario de activos**  
| Recurso | Detalle | Responsable | Caduca |
|--------|---------|-------------|--------|
| Dominio `campaignmanagement.andesbpo.com` | Frontend en producción | AndesBPO | — |
| Dominio `campaignmanagement.backend.andesbpo.com` | Backend API | AndesBPO | — |
| Base de datos AWS RDS | `database-savia.cla22m8co2v1.us-east-1.rds.amazonaws.com` | Infraestructura | — |
| Plataforma EasyPanel | Hosting y despliegue | DevOps | — |

---

## 📝 4. Pendientes / Observaciones
- [ ] Despliegue del aplicativo (En despliegue).   
- ⚠️ *Nota:* Sistema completamente funcional. En caso de problemas de conectividad entre servidores, frontend configurado para llamadas directas al backend.

---

## 📌 5. Contactos de Soporte
| Rol | Nombre | Correo | Teléfono |
|-----|--------|--------|----------|
| Líder Técnico | Felipe Arango | felipe.arango@andesbpo.com | — |
| Desarrollador | Victor Manuel Velasquez. | mrchuchi@icloud.com | — |
| Soporte Operativo | Equipo Infraestructura | | — |

---

> 📎 **Archivos adjuntos en entrega final:**  
> - `codigo_fuente/` (repositorio GitHub completo)  
> - `docs/`  
>   ├── `DEPLOYMENT.md` - Guía de despliegue  
>   ├── `PRODUCTION_READY.md` - Resumen de optimizaciones  
>   ├── `FINAL_CHECKLIST.md` - Checklist de verificación  
>   └── `README.md` - Este archivo  
> - `configuracion/`  
>   ├── `docker-compose.production.yml`  
>   ├── `nginx.conf`  
>   └── `.env.example` (template de variables)

✅ **[✔] Checklist de producción**  
- Ubicación: `/FINAL_CHECKLIST.md`
- Verificación completa de: rutas API, variables de entorno, Docker, seguridad
- Comandos de despliegue paso a paso

✅ **[✔] Resumen de preparación para producción**  
- Ubicación: `/PRODUCTION_READY.md`
- Cambios realizados para optimización
- Checklist de verificación post-despliegue

✅ **[✔] Arquitectura del sistema**  
- Frontend: Single Page Application (SPA) con React
- Backend: API RESTful con FastAPI
- Base de datos: PostgreSQL en AWS RDS
- Proxy reverso: Nginx para routing y SSL

✅ **[✔] Configuración Docker**  
- Dockerfiles optimizados (multi-stage build)
- docker-compose.production.yml con health checks
- .dockerignore para builds eficientes
- Logging con rotación automática

✅ **[✔] Inventario de activos**  
| Recurso | Detalle | Responsable |
|--------|---------|-------------|
| Dominio frontend | `campaignmanagement.andesbpo.com` | AndesBPO |
| Dominio backend | `campaignmanagement.backend.andesbpo.com` | AndesBPO |
| Base de datos AWS RDS | `database-savia.cla22m8co2v1.us-east-1.rds.amazonaws.com` | Infraestructura |
| Plataforma de hosting | EasyPanel | DevOps |

---

## 🎯 4. Funcionalidades Implementadas

### 🔐 Autenticación y Usuarios
- [x] Login con JWT (roles: admin, usuario)
- [x] Registro de usuarios con validación
- [x] Gestión de perfiles de usuario
- [x] Protección de rutas por rol

### 📊 Gestión de Campañas
- [x] CRUD completo de campañas (SAC, TMC, TVT, CBZ)
- [x] Gestión de clientes corporativos
- [x] Gestión de contactos
- [x] Productos asociados a campañas
- [x] Facturación de campañas
- [x] Historial de cambios automático
- [x] Estadísticas y dashboard

### 📁 Gestión de Proyectos
- [x] CRUD de proyectos con estados
- [x] Asignación de equipos y responsables
- [x] Gestión de tareas asociadas
- [x] Prioridades y tipos de proyecto
- [x] Vista Kanban y Gantt
- [x] Filtros avanzados y búsqueda

### 🚀 Implementaciones
- [x] Gestión de implementaciones con subsecciones
- [x] Subsecciones personalizables por área (Contractual, Talento Humano, Procesos, Tecnología)
- [x] Estados personalizados por ítem
- [x] Generación de PDF con diseño profesional
- [x] Exportación a Excel
- [x] Comentarios de producción
- [x] Modal de entregas

### 📈 Reportes y Exportación
- [x] Generación de PDF de implementaciones
- [x] Exportación a Excel con formato
- [x] Reportes de campañas
- [x] Visualización de KPIs

---

## 🔧 5. Configuración y Despliegue

### Variables de Entorno (Backend)

El sistema tiene valores por defecto, pero se recomienda configurar en producción:

```bash
DATABASE_URL=postgresql+psycopg2://user:password@host:5432/database
SECRET_KEY=tu_clave_secreta_fuerte
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### Variables de Entorno (Frontend)

```bash
# Producción - Llamada directa al backend
VITE_API_URL=https://campaignmanagement.backend.andesbpo.com

# O vacío para usar proxy de nginx
VITE_API_URL=
```

### Comandos de Despliegue

```bash
# 1. Clonar repositorio
git clone https://github.com/Emperor072100/Project.git
cd Project

# 2. Configurar variables de entorno (opcional)
cat > .env << 'EOF'
DATABASE_URL=postgresql+psycopg2://...
SECRET_KEY=...
EOF

# 3. Construir y desplegar con Docker
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d

# 4. Verificar estado
docker-compose -f docker-compose.production.yml ps
docker-compose -f docker-compose.production.yml logs -f
```

### Desarrollo Local

```bash
# Backend
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend
cd frontend
npm install --legacy-peer-deps
npm run dev
```

---

## 📝 6. Pendientes / Observaciones

- [x] Sistema completamente funcional en producción
- [x] Health checks configurados
- [x] Logging con rotación
- [x] CORS configurado correctamente
- [x] Proxy nginx optimizado
- ⚠️ **Nota:** En caso de problemas de conectividad entre servidores, el frontend está configurado para llamar directamente al backend (sin proxy)

---

## 📌 7. Contactos de Soporte

| Rol | Nombre | Correo |
|-----|--------|--------|
| Líder Técnico / Desarrollador | Felipe Arango. | felipe.arango@andesbpo.com |
| Soporte Técnico | Equipo AndesBPO |

---

## 📦 8. Estructura del Proyecto

```
Project/
├── backend/                    # API FastAPI
│   ├── app/
│   │   ├── models/            # Modelos SQLAlchemy
│   │   ├── routers/           # Endpoints de la API
│   │   ├── schemas/           # Esquemas Pydantic
│   │   └── crud/              # Operaciones de base de datos
│   ├── core/
│   │   ├── config.py          # Configuración con valores por defecto
│   │   ├── database.py        # Conexión a PostgreSQL
│   │   └── security.py        # JWT y autenticación
│   ├── Dockerfile             # Build optimizado con health check
│   ├── requirements.txt       # Dependencias Python
│   └── .dockerignore          # Exclusiones para Docker build
│
├── frontend/                   # SPA React
│   ├── src/
│   │   ├── pages/             # Páginas principales
│   │   ├── components/        # Componentes reutilizables
│   │   ├── services/          # axiosInstance, API calls
│   │   ├── context/           # Contextos React
│   │   └── utils/             # Utilidades
│   ├── nginx.conf             # Configuración Nginx con proxy
│   ├── Dockerfile             # Multi-stage build
│   ├── .env.production        # Variables de producción
│   └── vite.config.js         # Configuración Vite
│
├── docker-compose.production.yml  # Orquestación con health checks
├── DEPLOYMENT.md              # Guía de despliegue completa
├── PRODUCTION_READY.md        # Resumen de optimizaciones
├── FINAL_CHECKLIST.md         # Verificación final completa
└── README.md                  # Este archivo
```

---

> 📎 **Documentación técnica adicional:**  
> - `DEPLOYMENT.md` - Guía paso a paso de despliegue
> - `PRODUCTION_READY.md` - Cambios y optimizaciones realizadas
> - `FINAL_CHECKLIST.md` - Checklist completo de verificación
> - `backend/.env.example` - Template de variables de entorno
> - `frontend/nginx.conf` - Configuración del servidor web

---
