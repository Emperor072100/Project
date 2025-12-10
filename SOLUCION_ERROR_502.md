# 🔧 Solución Error 502 - CORS Missing Allow Origin

## ❌ Problema
```
CORS Missing Allow Origin
Solicitud desde otro origen bloqueada: la política de mismo origen impide leer el recurso remoto 
en https://campaignmanagement.backend.andesbpo.com/auth/login 
(razón: falta la cabecera CORS 'Access-Control-Allow-Origin'). 
Código de estado: 502.
```

## 🔍 Diagnóstico

El **error 502 Bad Gateway** indica que el backend **NO está respondiendo**. El error CORS es **secundario** - aparece porque el servidor nunca llega a procesar la petición y enviar las cabeceras CORS.

### Causas posibles del 502:
1. ❌ El servicio backend no está corriendo en EasyPanel
2. ❌ El contenedor Docker del backend está detenido o crasheado
3. ❌ Error en la configuración del backend (variables de entorno, base de datos)
4. ❌ Puerto 8000 no expuesto o bloqueado
5. ❌ Proxy inverso de EasyPanel mal configurado

## ✅ Soluciones Implementadas

### 1. Corrección de nginx.conf (proxy_pass)
**CRÍTICO**: Agregada barra final en `proxy_pass` para remover `/api/` del path

```nginx
location /api/ {
    proxy_pass https://campaignmanagement.backend.andesbpo.com/;  # ← Barra final agregada
    # Resto de configuración...
}
```

**¿Por qué?**
- Sin barra: `/api/auth/login` → `https://backend.com/api/auth/login` ❌
- Con barra: `/api/auth/login` → `https://backend.com/auth/login` ✅

### 2. Simplificación de axiosConfig.js
Removida lógica innecesaria. Ahora funciona así:

```javascript
// MODO 1: URL configurada → llamadas directas (browser → backend)
if (VITE_API_URL) return VITE_API_URL;

// MODO 2: Sin URL → proxy nginx (browser → nginx → backend)
return '/api';
```

## 📋 Checklist de Verificación en EasyPanel

### ✅ 1. Verificar que el backend esté corriendo
```bash
# En EasyPanel, verificar logs del contenedor backend:
docker logs <container_name_backend>

# Debe mostrar:
# ✅ Todos los routers registrados correctamente
# ⚡ Iniciando servidor...
# INFO: Application startup complete.
```

### ✅ 2. Verificar variables de entorno del backend
En EasyPanel, asegurar que estas variables estén configuradas:
```env
DATABASE_URL=postgresql+psycopg2://postgres:89.J(GIidcx2^P9G@database-savia.cla22m8co2v1.us-east-1.rds.amazonaws.com:5432/savia
SECRET_KEY=tu_secret_key_super_segura_aqui_cambiar_en_produccion
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**NOTA**: Si no están configuradas, el backend usará valores por defecto (ver `backend/core/config.py`)

### ✅ 3. Verificar puertos expuestos
- Backend debe exponer puerto **8000**
- Frontend debe exponer puerto **80**

### ✅ 4. Verificar health checks
```bash
# Probar el health check del backend directamente:
curl https://campaignmanagement.backend.andesbpo.com/

# Debe responder:
# {"message": "API Campañas funcionando correctamente"}
```

### ✅ 5. Verificar logs de nginx del frontend
```bash
docker logs <container_name_frontend>

# Buscar errores de proxy:
# ❌ upstream timed out
# ❌ no resolver defined
# ❌ connection refused
```

## 🚀 Pasos para Desplegar la Corrección

### Opción A: Rebuild en EasyPanel (Recomendado)
1. Hacer commit de los cambios:
   ```bash
   git add frontend/nginx.conf frontend/src/services/axiosConfig.js
   git commit -m "fix: Corregir proxy nginx y axiosConfig para resolver error 502"
   git push origin main
   ```

2. En EasyPanel:
   - Ir al proyecto del **frontend**
   - Click en **"Rebuild"** o **"Deploy"**
   - Esperar a que termine el build

3. Verificar en navegador:
   - Abrir https://campaignmanagement.andesbpo.com
   - Intentar login
   - Revisar consola del navegador (F12) para ver los logs de axiosConfig

### Opción B: Restart Services
Si el backend **ya está corriendo** pero no responde:
1. En EasyPanel → Backend service → **Restart**
2. En EasyPanel → Frontend service → **Restart**

## 🔍 Debugging Avanzado

### Verificar conectividad backend desde frontend
```bash
# Entrar al contenedor del frontend:
docker exec -it <frontend_container> sh

# Probar conectividad al backend:
wget -O- https://campaignmanagement.backend.andesbpo.com/
curl https://campaignmanagement.backend.andesbpo.com/

# Si falla: problema de red/DNS
# Si funciona: problema en nginx.conf
```

### Verificar CORS del backend
```bash
# Probar petición OPTIONS (preflight CORS):
curl -X OPTIONS https://campaignmanagement.backend.andesbpo.com/auth/login \
  -H "Origin: https://campaignmanagement.andesbpo.com" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Debe responder con:
# Access-Control-Allow-Origin: https://campaignmanagement.andesbpo.com
# Access-Control-Allow-Methods: *
```

## 📊 Modos de Operación

| Modo | VITE_API_URL | Flujo | Uso |
|------|--------------|-------|-----|
| **Proxy** | No configurada | Browser → Nginx → Backend | Producción (recomendado) |
| **Directo** | `https://backend.com` | Browser → Backend | Desarrollo / Fallback |

**Recomendación**: En producción usar **modo proxy** (sin VITE_API_URL) para evitar CORS y centralizar configuración en nginx.

## ✅ Verificación Final

Después del deploy, verificar:
1. ✅ https://campaignmanagement.backend.andesbpo.com/ responde con mensaje JSON
2. ✅ https://campaignmanagement.andesbpo.com carga correctamente
3. ✅ Login funciona sin errores CORS
4. ✅ Consola del navegador muestra: `🔄 Usando proxy /api (nginx redirige al backend)`
5. ✅ Network tab muestra peticiones a `/api/auth/login` (no al dominio completo)

## 🆘 Si el Problema Persiste

1. **Verificar logs del backend** - puede haber error en el código Python
2. **Verificar logs de EasyPanel** - puede haber problema de infraestructura
3. **Probar endpoint directo** - `https://campaignmanagement.backend.andesbpo.com/auth/login` en Postman
4. **Verificar firewall** - puede estar bloqueando conexiones entre servicios
5. **Contactar soporte de EasyPanel** - puede haber problema de red interna

---

**Fecha**: 10/12/2025  
**Autor**: Sistema de Gestión de Campañas - Equipo Técnico
