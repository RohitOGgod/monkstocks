# Root Dockerfile (multi-stage orchestrator)
# This image can optionally build both frontend and backend artifacts.
# In production you'll typically build and run them separately or via docker-compose.

# --- Backend build (optional) ---
FROM node:18-alpine AS backend
WORKDIR /workspace/backend
COPY backend/package*.json ./
RUN npm ci --only=production || npm install --production
COPY backend/. .

# --- Frontend build (optional) ---
FROM node:18-alpine AS frontend
WORKDIR /workspace/frontend
COPY frontend/package*.json ./
RUN npm ci || npm install
COPY frontend/. .
RUN npm run build

# --- Final stage ---
# This final image contains Nginx serving frontend; backend should be a separate service.
FROM nginx:1.25-alpine AS final
COPY --from=frontend /workspace/frontend/build /usr/share/nginx/html
RUN printf 'server {\n  listen 80;\n  server_name _;\n  root /usr/share/nginx/html;\n  index index.html;\n  gzip on;\n  location / {\n    try_files $uri /index.html;\n  }\n}\n' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
