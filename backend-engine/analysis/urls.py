from django.urls import path
from .views import RegisterView, VerifyEmailView, GameUploadView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", TokenObtainPairView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path(
        "verify-email/<str:uidb64>/<str:token>/",
        VerifyEmailView.as_view(),
        name="verify_email",
    ),
    path("upload/", GameUploadView.as_view(), name="upload_game"),
]
