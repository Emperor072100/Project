# Construcción de la app
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Verificar que index.html existe y build
RUN ls -la && \
    if [ ! -f "index.html" ]; then echo "ERROR: index.html not found"; exit 1; fi && \
    chmod -R +x node_modules/.bin/ && \
    npm run build

# Servidor estático de producción
FROM nginx:alpine

# Copiar archivos construidos
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Crear directorio para logs si no existe
RUN mkdir -p /var/log/nginx

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]