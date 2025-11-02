# syntax=docker/dockerfile:1
FROM python:3.11-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app/agent

# System deps (kept minimal)
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy only agent code and its requirements
COPY requirements.txt ./requirements.txt
RUN pip install -r requirements.txt

COPY . ./

EXPOSE 9000

# The app uses absolute imports like `from models import ...`,
# so we keep WORKDIR at /app/agent and run `app:app`.
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "9000"]
