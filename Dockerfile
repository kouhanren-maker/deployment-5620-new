FROM python:3.10-slim

WORKDIR /app

# 安装 Node & Python 环境
RUN apt-get update && apt-get install -y nodejs npm && rm -rf /var/lib/apt/lists/*

# 复制三个子项目
COPY frontend/ ./frontend/
COPY shopping/ ./shopping/
COPY agent/ ./agent/
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

# 安装依赖
RUN pip install --no-cache-dir -r shopping/requirements.txt
RUN pip install --no-cache-dir -r agent/requirements.txt

# 构建前端
WORKDIR /app/frontend
RUN npm install && npm run build

# 复制静态文件到 Django 后端
WORKDIR /app/shopping
RUN mkdir -p staticfiles && cp -r /app/frontend/dist/* ./staticfiles/

# 暴露端口
WORKDIR /app
EXPOSE 8000
CMD ["./start.sh"]
