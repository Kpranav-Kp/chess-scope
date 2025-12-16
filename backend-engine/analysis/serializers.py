from django.contrib.auth.models import User
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
import re
from .models import Game


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def validate_password(self, value):
        validate_password(value)
        if not re.search(r"[A-Z]", value):
            raise serializers.ValidationError(
                "Password must contain at least one uppercase letter."
            )
        if not re.search(r"\d", value):
            raise serializers.ValidationError(
                "Password must contain at least one digit."
            )
        if len(re.findall(r"[!@#$%^&*(),.?\":{}|<>]", value)) < 2:
            raise serializers.ValidationError(
                "Password must contain at least two special character."
            )
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            is_active=False,
        )

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        verification_link = f"http://localhost:8000/api/verify-email/{uid}/{token}/"

        send_mail(
            subject="Verify your email",
            message=f"Click the link to verify your email: {verification_link}",
            from_email="pranavk.2005.gip@gmail.com",
            recipient_list=[user.email],
        )
        return user


class GameUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ["pgn"]

    def validate_pgn(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("PGN cannot be empty.")

        if "[" not in value or "]" not in value:
            raise serializers.ValidationError("Invalid PGN format.")

        return value
