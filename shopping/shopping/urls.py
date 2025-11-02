"""
URL configuration for shopping project.
"""

from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.http import HttpResponse
import os


# ✅ 根路径返回前端构建好的 index.html
def serve_frontend(request):
    index_path = os.path.join(settings.STATIC_ROOT, "index.html")
    try:
        with open(index_path, encoding="utf-8") as f:
            return HttpResponse(f.read())
    except FileNotFoundError:
        return HttpResponse(
            "⚠️ Frontend not built or staticfiles missing. Please run npm run build and redeploy.",
            status=501,
        )


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("app.urls")),  # ✅ 所有后端接口统一前缀 /api/
    re_path(r"^$", serve_frontend),     # ✅ 根路径返回 React 前端
    re_path(r"^(?:.*)/?$", serve_frontend),  # ✅ 支持 React Router 路由（前端内部路径）
]
