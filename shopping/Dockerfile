# ===== Base =====
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1

# 运行期需要的系统包：证书、时区、netcat(可选)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates tzdata netcat-openbsd \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
# 先安装依赖（尽量利用缓存）
# ⚠️ requirements.txt 里请确保包含：Django、gunicorn、pymysql、python-dotenv(如果用到了)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# 拷贝项目源码
COPY . .
# 收集静态资源（需在 settings.py 设置 STATIC_ROOT）
RUN python manage.py collectstatic --noinput || true
# 非 root 运行更安全
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser
EXPOSE 8000
# 启动前做迁移；若数据库暂时不可用，简单重试几次
# 如果你不想重试机制，把 for 循环去掉即可
ENTRYPOINT ["bash", "-lc", "gunicorn shopping.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers 1 \
  --timeout 120 \
  --log-level debug \
  --access-logfile - \
  --error-logfile - \
  --capture-output"]

