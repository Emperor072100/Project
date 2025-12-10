# ============================================
# GUÍA DE DESPLIEGUE EN PRODUCCIÓN
# ============================================

## Pre-requisitos

1. **Servidor con Docker y Docker Compose instalado**
2. **Dominios configurados:**
   - Frontend: `campaignmanagement.andesbpo.com`
   - Backend: `campaignmanagement.backend.andesbpo.com`
3. **Certificados SSL configurados**
4. **Base de datos PostgreSQL accesible**

---

## Paso 1: Configurar Variables de Entorno

En el servidor de producción, crear archivo `.env` en la raíz del proyecto:

```bash
# Crear archivo .env con variables sensibles
cat > .env << 'EOF'
DATABASE_URL=postgresql+psycopg2://user:password@host:5432/database
SECRET_KEY=tu_clave_secreta_muy_fuerte_y_aleatoria_minimo_32_caracteres
ACCESS_TOKEN_SECRET=otro_token_secreto_diferente_muy_fuerte
ACCESS_TOKEN_EXPIRE_MINUTES=60
ALGORITHM=HS256
EOF

# Proteger el archivo
chmod 600 .env
```

---

## Paso 2: Build y Despliegue

```bash
# 1. Clonar o actualizar el repositorio
git pull origin main

# 2. Cargar variables de entorno
export $(cat .env | xargs)

# 3. Detener contenedores anteriores (si existen)
docker-compose -f docker-compose.production.yml down

# 4. Construir imágenes (con caché para ser más rápido)
docker-compose -f docker-compose.production.yml build

# 5. Iniciar contenedores
docker-compose -f docker-compose.production.yml up -d

# 6. Verificar estado
docker-compose -f docker-compose.production.yml ps
docker-compose -f docker-compose.production.yml logs -f
```

---

## Paso 3: Rebuild completo (sin caché)

Si hay problemas, reconstruir sin caché:

```bash
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d --force-recreate
```

---

## Verificación de Health Checks

```bash
# Ver estado de salud de los contenedores
docker ps

# Debería mostrar "healthy" en la columna STATUS
```

---

## Logs y Debugging

```bash
# Ver logs en tiempo real
docker-compose -f docker-compose.production.yml logs -f

# Ver logs solo del backend
docker-compose -f docker-compose.production.yml logs -f backend

# Ver logs solo del frontend
docker-compose -f docker-compose.production.yml logs -f frontend

# Ver últimas 100 líneas
docker-compose -f docker-compose.production.yml logs --tail=100
```

---

## Rollback en caso de problemas

```bash
# Detener contenedores actuales
docker-compose -f docker-compose.production.yml down

# Volver a commit anterior
git checkout <commit-hash-anterior>

# Reconstruir y desplegar
docker-compose -f docker-compose.production.yml up -d --build
```

---

## Mantenimiento

### Limpiar imágenes antiguas

```bash
# Limpiar imágenes no usadas
docker image prune -a

# Limpiar todo (cuidado: elimina volúmenes también)
docker system prune -a --volumes
```

### Actualizar solo el frontend

```bash
docker-compose -f docker-compose.production.yml build frontend
docker-compose -f docker-compose.production.yml up -d frontend
```

### Actualizar solo el backend

```bash
docker-compose -f docker-compose.production.yml build backend
docker-compose -f docker-compose.production.yml up -d backend
```

---

## Checklist de Verificación Post-Despliegue

- [ ] Contenedores corriendo: `docker ps` muestra ambos contenedores
- [ ] Health checks pasando: STATUS muestra "(healthy)"
- [ ] Frontend accesible: https://campaignmanagement.andesbpo.com
- [ ] Backend accesible: https://campaignmanagement.backend.andesbpo.com
- [ ] Login funciona correctamente
- [ ] Endpoints de API responden (probar /estados, /proyectos, etc.)
- [ ] No hay errores de CORS en la consola del navegador
- [ ] Logs no muestran errores críticos

---

## Problemas Comunes

### 1. Timeouts en el proxy de Nginx

**Síntoma:** Error 504 Gateway Timeout  
**Solución:** Verificar que el backend esté accesible desde el contenedor frontend

```bash
# Entrar al contenedor frontend
docker exec -it sgc-frontend-prod sh

# Probar conectividad
wget https://campaignmanagement.backend.andesbpo.com/
```

### 2. Errores de CORS

**Síntoma:** Error en consola del navegador sobre CORS  
**Solución:** Verificar que `backend/main.py` incluye el dominio correcto en `allow_origins`

### 3. Variables de entorno no cargadas

**Síntoma:** Backend no puede conectarse a la base de datos  
**Solución:** 
```bash
# Verificar variables en el contenedor
docker exec sgc-backend-prod env | grep DATABASE_URL
```

### 4. Build falla en frontend

**Síntoma:** Error durante npm run build  
**Solución:**
```bash
# Limpiar node_modules y reinstalar
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run build
```

---

## Monitoreo

### Ver uso de recursos

```bash
docker stats
```

### Ver tamaño de logs

```bash
docker-compose -f docker-compose.production.yml logs --no-color | wc -l
```

---

## Contacto y Soporte

Para problemas o preguntas, contactar al equipo de desarrollo.
