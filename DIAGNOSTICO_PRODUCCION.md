# 🚨 Diagnóstico Error 500/502 en Producción

## Problema Actual
```
❌ Error 500/502 en todos los endpoints
❌ CORS Missing Allow Origin (consecuencia del 500/502)
✅ Frontend desplegado correctamente
✅ VITE_API_URL configurado: https://campaignmanagement.backend.andesbpo.com
```

## Causa Raíz Identificada

El **backend está crasheando** al iniciar. Los errores CORS son **secundarios** porque el servidor nunca llega a procesar las peticiones.

### Archivos Conflictivos
```
/backend/main.py          ← ✅ Archivo CORRECTO (usado por Gunicorn)
/backend/app/main.py      ← ⚠️  Archivo alternativo (CORS ya actualizado)
```

## ✅ Correcciones Aplicadas

### 1. CORS actualizado en `/backend/app/main.py`
```python
allow_origins=[
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "https://campaignmanagement.andesbpo.com",  # Frontend
    "https://campaignmanagement.backend.andesbpo.com"  # Backend (docs)
]
```

### 2. Verificar que Dockerfile use el `main.py` correcto
```dockerfile
CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", \
     "--bind", "0.0.0.0:8000", \
     "--workers", "4", \
     "--timeout", "120", \
     "main:app"]  # ← Debe ser "main:app" (raíz del proyecto)
```

## 🔍 Checklist Diagnóstico en EasyPanel

### Paso 1: Verificar logs del backend
```bash
# En EasyPanel → Backend Service → Logs
# Buscar estos mensajes:

✅ DEBE MOSTRAR:
- "✅ Todos los routers registrados correctamente"
- "INFO: Application startup complete."
- "INFO: Uvicorn running on http://0.0.0.0:8000"

❌ SI MUESTRA ERRORES:
- "ModuleNotFoundError: No module named 'X'"
- "ImportError: cannot import name 'X'"
- "sqlalchemy.exc.OperationalError" (error de BD)
- "ValueError" o "KeyError" en variables de entorno
```

### Paso 2: Verificar variables de entorno
En EasyPanel, asegurar que estas variables estén configuradas **o comentadas** (tienen defaults):

```env
# Requeridas para conectar a la base de datos
DATABASE_URL=postgresql+psycopg2://postgres:89.J(GIidcx2^P9G@database-savia.cla22m8co2v1.us-east-1.rds.amazonaws.com:5432/savia

# Opcionales (tienen valores por defecto en core/config.py)
SECRET_KEY=cambiar_en_produccion_por_valor_seguro
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### Paso 3: Probar health check manualmente
```bash
# Desde la terminal de EasyPanel o tu máquina:
curl https://campaignmanagement.backend.andesbpo.com/

# DEBE RESPONDER:
{"message":"API Campañas funcionando correctamente"}

# SI NO RESPONDE o da 502:
# → El contenedor no está corriendo o crashea al iniciar
```

### Paso 4: Verificar conectividad a base de datos
```bash
# Dentro del contenedor del backend (si está corriendo):
docker exec -it <backend_container> python3 -c "
from core.database import engine
from sqlalchemy import text
with engine.connect() as conn:
    result = conn.execute(text('SELECT 1'))
    print('✅ Conexión a BD exitosa')
"

# SI FALLA:
# → Revisar DATABASE_URL (host, puerto, credenciales)
# → Verificar firewall/security groups de AWS RDS
```

## 🛠️ Soluciones Posibles

### Solución 1: Problemas de Importación
Si los logs muestran `ModuleNotFoundError` o `ImportError`:

```bash
# Verificar que requirements.txt esté instalado correctamente
# En el Dockerfile debe haber:
RUN pip install --no-cache-dir -r requirements.txt

# Verificar que todas las dependencias estén en requirements.txt:
- fastapi
- uvicorn
- gunicorn
- sqlalchemy
- psycopg2-binary (NO psycopg2)
- python-jose[cryptography]
- passlib[bcrypt]
- python-multipart
```

### Solución 2: Error de Base de Datos
Si los logs muestran `sqlalchemy.exc.OperationalError`:

```python
# Verificar en core/config.py:
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://postgres:PASSWORD@database-savia.cla22m8co2v1.us-east-1.rds.amazonaws.com:5432/savia"
)

# ⚠️ IMPORTANTE: 
# - Usar psycopg2, NO asyncpg
# - Verificar que RDS permita conexiones desde EasyPanel
# - Verificar security groups de AWS
```

### Solución 3: Variables de Entorno Faltantes
Si los logs muestran `KeyError` o `ValueError`:

```bash
# En EasyPanel, configurar:
DATABASE_URL=postgresql+psycopg2://...
SECRET_KEY=tu_clave_secreta_super_segura_de_al_menos_32_caracteres
```

### Solución 4: Puerto No Expuesto
```dockerfile
# Verificar en Dockerfile:
EXPOSE 8000

# Verificar en docker-compose.production.yml o configuración de EasyPanel:
ports:
  - "8000:8000"
```

## 🚀 Pasos de Rebuild

### 1. Hacer commit de las correcciones
```bash
git add backend/app/main.py
git commit -m "fix: Actualizar CORS en app/main.py para incluir ambos dominios de producción"
git push origin main
```

### 2. Rebuild en EasyPanel
1. **Backend Service:**
   - Click en "Rebuild" o "Deploy"
   - Esperar logs: "INFO: Application startup complete."
   - Probar: `curl https://campaignmanagement.backend.andesbpo.com/`

2. **Frontend Service:**
   - NO necesita rebuild (nginx.conf ya corregido previamente)
   - Si persiste error, hacer rebuild también

### 3. Verificación Post-Deploy
```bash
# 1. Health check backend
curl https://campaignmanagement.backend.andesbpo.com/
# Debe responder: {"message":"API Campañas funcionando correctamente"}

# 2. Probar login desde navegador
# Abrir: https://campaignmanagement.andesbpo.com/login
# Intentar login
# Revisar consola (F12) → Network tab

# 3. Verificar que NO haya errores 500/502
# Debe mostrar:
# ✅ POST /auth/login → 200 (o 401 si credenciales incorrectas)
# ✅ GET /estados/ → 200
# ✅ GET /prioridades/ → 200
```

## 📊 Matriz de Errores y Soluciones

| Error | Código | Causa | Solución |
|-------|--------|-------|----------|
| CORS Missing Allow Origin | 500/502 | Backend crasheado | Ver logs, corregir código Python |
| sqlalchemy.exc.OperationalError | 500 | No conecta a BD | Verificar DATABASE_URL, security groups |
| ModuleNotFoundError | 500 | Dependencia faltante | Actualizar requirements.txt, rebuild |
| KeyError: 'SECRET_KEY' | 500 | Env var faltante | Configurar en EasyPanel o usar default |
| Connection refused | 502 | Backend no corriendo | Verificar que contenedor esté UP |
| Upstream timed out | 502 | Backend no responde | Aumentar timeouts, verificar workers |

## 🆘 Debugging Avanzado

### Ver logs en tiempo real
```bash
# En EasyPanel → Backend Service → Logs → Enable "Follow"
# Hacer rebuild y observar la salida
```

### Entrar al contenedor
```bash
# Si el contenedor está corriendo:
docker exec -it <backend_container> bash

# Probar iniciar manualmente:
python -c "from main import app; print('✅ App cargada correctamente')"

# Probar conectar a BD:
python -c "from core.database import engine; print(engine.url)"
```

### Probar localmente con misma configuración
```bash
# En tu máquina, simular producción:
cd backend
export DATABASE_URL="postgresql+psycopg2://..."
export SECRET_KEY="test123"
gunicorn -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 --workers 1 main:app

# Probar:
curl http://localhost:8000/
```

## ✅ Checklist Final

- [ ] Logs del backend muestran "Application startup complete"
- [ ] `curl https://campaignmanagement.backend.andesbpo.com/` responde JSON
- [ ] Login en frontend NO da error 500/502
- [ ] Peticiones a `/estados/`, `/prioridades/` responden 200 o 401
- [ ] Consola del navegador NO muestra "CORS Missing Allow Origin"
- [ ] Database connection funciona (verificar logs)

---

**Fecha**: 11/12/2025  
**Próximo paso**: Verificar logs del backend en EasyPanel para identificar causa exacta del crash
