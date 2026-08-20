# Multi-stage Dockerfile for Railway deployment
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

FROM python:3.11-slim AS backend

WORKDIR /app

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./

# Copy frontend build to backend for serving
COPY --from=frontend-builder /app/frontend/out ./frontend/out

ENV DATABASE_URL=postgresql://neondb_owner:npg_WzCOhSJ0dn6f@ep-nameless-bird-ay266zed.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require
ENV PORT=8000

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
