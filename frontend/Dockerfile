# Frontend Dockerfile (React + Nginx)

# 1) Build stage
FROM node:18-alpine AS build
WORKDIR /app
ENV NODE_OPTIONS=--openssl-legacy-provider \
    SKIP_PREFLIGHT_CHECK=true

# Avoid downloading Cypress binary during install (devDependency)
ARG CYPRESS_INSTALL_BINARY=0
ENV CYPRESS_INSTALL_BINARY=${CYPRESS_INSTALL_BINARY}
# Install deps
COPY package*.json ./
# Use --ignore-scripts to skip dev postinstalls like Cypress; craco/react build works without postinstall
RUN npm ci --ignore-scripts || npm install --ignore-scripts
# Copy source and build
COPY . .
# Build with default envs; override REACT_APP_* at build time if needed
RUN npm run build

# 2) Runtime stage
FROM nginx:1.25-alpine AS runtime
# Copy build to Nginx html
COPY --from=build /app/build /usr/share/nginx/html
# Simple SPA fallback to index.html
RUN printf 'server {\n  listen 80;\n  server_name _;\n  root /usr/share/nginx/html;\n  index index.html;\n  gzip on;\n  location / {\n    try_files $uri /index.html;\n  }\n  location /static/ {\n    expires 7d;\n    add_header Cache-Control "public, max-age=604800, immutable";\n  }\n}\n' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
