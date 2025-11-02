# ---------- 前端阶段 ----------
FROM node:20-alpine AS frontend
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend .
RUN npm run build

# ---------- 后端阶段 ----------
FROM python:3.11-slim AS backend
WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y libmariadb-dev && rm -rf /var/lib/apt/lists/*

# 拷贝 requirements 并安装依赖
COPY shopping/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 拷贝后端代码
COPY shopping .

# 拷贝前端构建产物到 Django 静态目录
COPY --from=frontend /frontend/dist ./staticfiles

# 设置环境变量
ENV DJANGO_SETTINGS_MODULE=shopping.settings
ENV PORT=8000
ENV PYTHONUNBUFFERED=1

# 收集静态文件（必须）
RUN python manage.py collectstatic --noinput

# 暴露端口
EXPOSE 8000

# 启动 Gunicorn（生产部署推荐）
CMD ["gunicorn", "shopping.wsgi:application", "--bind", "0.0.0.0:8000"]
