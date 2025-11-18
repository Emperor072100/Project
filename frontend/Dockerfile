# Construcción de la app
FROM node:20-alpine AS build
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm ci --only=production=false

# Copiar el resto del código fuente  
COPY . .

# Construir la aplicación (CRÍTICO - No puede estar comentado)
RUN npm run build && ls -la dist/

# Verificar que dist/ existe y tiene contenido
RUN if [ ! -d "dist" ]; then echo "ERROR: dist/ directory not found after build"; exit 1; fi
RUN if [ -z "$(ls -A dist/)" ]; then echo "ERROR: dist/ directory is empty"; exit 1; fi

# Servidor estático de producción
FROM nginx:alpine

# Copiar archivos construidos (verificar que existan)
COPY --from=build /app/dist /usr/share/nginx/html

# Configuración de Nginx para SPA con proxy API (embebida para evitar archivos externos)
RUN echo 'server {' > /etc/nginx/conf.d/default.conf && \
    echo '    listen 80;' >> /etc/nginx/conf.d/default.conf && \
    echo '    server_name _;' >> /etc/nginx/conf.d/default.conf && \
    echo '    root /usr/share/nginx/html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    index index.html;' >> /etc/nginx/conf.d/default.conf && \
    echo '' >> /etc/nginx/conf.d/default.conf && \
    echo '    # Proxy para API - CRÍTICO para evitar CORS' >> /etc/nginx/conf.d/default.conf && \
    echo '    location /api/ {' >> /etc/nginx/conf.d/default.conf && \
    echo '        proxy_pass http://backend:8000/;' >> /etc/nginx/conf.d/default.conf && \
    echo '        proxy_set_header Host $host;' >> /etc/nginx/conf.d/default.conf && \
    echo '        proxy_set_header X-Real-IP $remote_addr;' >> /etc/nginx/conf.d/default.conf && \
    echo '        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;' >> /etc/nginx/conf.d/default.conf && \
    echo '        proxy_set_header X-Forwarded-Proto $scheme;' >> /etc/nginx/conf.d/default.conf && \
    echo '        proxy_connect_timeout 30s;' >> /etc/nginx/conf.d/default.conf && \
    echo '        proxy_send_timeout 30s;' >> /etc/nginx/conf.d/default.conf && \
    echo '        proxy_read_timeout 30s;' >> /etc/nginx/conf.d/default.conf && \
    echo '    }' >> /etc/nginx/conf.d/default.conf && \
    echo '' >> /etc/nginx/conf.d/default.conf && \
    echo '    # (Opcional) Proxy para /auth/ si el frontend no usa /api/' >> /etc/nginx/conf.d/default.conf && \
    echo '    location /auth/ {' >> /etc/nginx/conf.d/default.conf && \
    echo '        proxy_pass http://backend:8000/auth/;' >> /etc/nginx/conf.d/default.conf && \
    echo '        proxy_set_header Host $host;' >> /etc/nginx/conf.d/default.conf && \
    echo '        proxy_set_header X-Real-IP $remote_addr;' >> /etc/nginx/conf.d/default.conf && \
    echo '        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;' >> /etc/nginx/conf.d/default.conf && \
    echo '        proxy_set_header X-Forwarded-Proto $scheme;' >> /etc/nginx/conf.d/default.conf && \
    echo '        proxy_connect_timeout 30s;' >> /etc/nginx/conf.d/default.conf && \
    echo '        proxy_send_timeout 30s;' >> /etc/nginx/conf.d/default.conf && \
    echo '        proxy_read_timeout 30s;' >> /etc/nginx/conf.d/default.conf && \
    echo '    }' >> /etc/nginx/conf.d/default.conf && \
    echo '' >> /etc/nginx/conf.d/default.conf && \
    echo '    # SPA routing - Para React Router' >> /etc/nginx/conf.d/default.conf && \
    echo '    location / {' >> /etc/nginx/conf.d/default.conf && \
    echo '        try_files $uri $uri/ /index.html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    }' >> /etc/nginx/conf.d/default.conf && \
    echo '' >> /etc/nginx/conf.d/default.conf && \
    echo '    # Headers de seguridad' >> /etc/nginx/conf.d/default.conf && \
    echo '    add_header X-Frame-Options "SAMEORIGIN" always;' >> /etc/nginx/conf.d/default.conf && \
    echo '    add_header X-Content-Type-Options "nosniff" always;' >> /etc/nginx/conf.d/default.conf && \
    echo '}' >> /etc/nginx/conf.d/default.conf

# Verificar configuración de Nginx
# RUN nginx -t

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
