# Construcción de la app
FROM node:20-alpine AS build
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm install --legacy-peer-deps

# Copiar el resto del código fuente  
COPY . .

# Construir la aplicación para producción
RUN npm run build

# Verificar que dist/ existe y tiene contenido
RUN if [ ! -d "dist" ]; then echo "ERROR: dist/ directory not found after build"; exit 1; fi
RUN if [ -z "$(ls -A dist/)" ]; then echo "ERROR: dist/ directory is empty"; exit 1; fi

# ============================================
# Servidor estático de producción con Nginx
# ============================================
FROM nginx:alpine

# Copiar archivos construidos
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración de Nginx (usar archivo externo para mejor mantenimiento)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Verificar configuración de Nginx
RUN nginx -t

# Exponer puerto 80
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
