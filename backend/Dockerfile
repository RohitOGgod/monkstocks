# Backend Dockerfile
# Build a lightweight Node image for the Express API

FROM node:18-alpine AS base
ENV NODE_ENV=production
WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --only=production || npm install --production

# Copy the rest of the backend source
COPY . .

# Expose API port
EXPOSE 5000

# Start the server
CMD ["node", "index.js"]
