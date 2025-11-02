"""
Django settings for shopping project.
"""

import os
from pathlib import Path
import pymysql
from dotenv import load_dotenv

# ------------------- 基础设置 -------------------
pymysql.install_as_MySQLdb()
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

# ------------------- 安全配置 -------------------
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "django-insecure-temp-secret-key")
DEBUG = os.getenv("DEBUG", "True").lower() in ("1", "true", "yes")

# ✅ 允许 Render 访问的域名（关键修改点）
# 从环境变量中读取，否则默认允许 Render 域名
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1,.onrender.com").split(",")

# ------------------- 应用与中间件 -------------------
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "app.apps.IntelligentShoppingAssistantConfig",
    "rest_framework",
    "corsheaders",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "shopping.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "shopping.wsgi.application"

# ------------------- 数据库配置 -------------------
DB_ENGINE = os.getenv("DB_ENGINE", "django.db.backends.sqlite3")
DB_NAME = os.getenv("DB_NAME", BASE_DIR / "db.sqlite3")
DB_USER = os.getenv("DB_USER", "")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_HOST = os.getenv("DB_HOST", "")
DB_PORT = os.getenv("DB_PORT", "")

DB_SSL = os.getenv("DB_SSL", "true").lower() in ("1", "true", "yes")
DB_SSL_CA = os.getenv("DB_SSL_CA", "/app/ca.pem")

db_options = {
    "charset": "utf8mb4",
    "init_command": "SET sql_mode='STRICT_TRANS_TABLES'",
}
if DB_SSL:
    db_options["ssl"] = {"ca": DB_SSL_CA}

DATABASES = {
    "default": {
        "ENGINE": DB_ENGINE,
        "NAME": DB_NAME,
        "USER": DB_USER,
        "PASSWORD": DB_PASSWORD,
        "HOST": DB_HOST,
        "PORT": DB_PORT,
        "OPTIONS": db_options,
    }
}
CONN_MAX_AGE = int(os.getenv("DJANGO_DB_CONN_MAX_AGE", "60"))

# ------------------- 认证与安全 -------------------
JWT_SECRET = os.getenv("JWT_SECRET", "replace-this-with-a-strong-secret")
JWT_ALGORITHM = "HS256"
JWT_EXP_DELTA_SECONDS = 60 * 60 * 24  # 1 day

# ------------------- CORS -------------------
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# ------------------- 静态文件配置 -------------------
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = []

# ------------------- 国际化 -------------------
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Australia/Sydney"
USE_I18N = True
USE_TZ = True

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
