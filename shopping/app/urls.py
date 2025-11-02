from django.urls import path
from . import views

urlpatterns = [
    # path("reco/<int:user_id>/", views.recommend_historical),
    # path("reco/new/", views.recommend_new),
    path("api/customer/<int:user_id>/", views.process_customer_data),
    path("api/customer/<int:user_id>/preferences/", views.save_customer_preferences, name="user_preferences"),

    path("api/", views.hello_view, name="hello"),
    path("api/register/", views.register_view, name="register"),
    path("api/login/", views.login_view, name="login"),
    path("api/logout/", views.logout_view, name="logout"),

    path("api/admin/list_users/", views.list_users_view, name="list_users"),
    path("api/merchant/<int:user_id>/user_portrait/", views.merchant_profile),

    path("api/merchant/report/<int:user_id>/", views.generate_merchant_report, name="merchant_report"),
    
]