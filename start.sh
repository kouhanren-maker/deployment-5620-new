#!/bin/bash
echo "🚀 启动后端 + Agent ..."

cd /app/agent
uvicorn app:app --host 0.0.0.0 --port 10000 &

cd /app/shopping
python manage.py migrate --noinput
python manage.py collectstatic --noinput
python manage.py runserver 0.0.0.0:$PORT
