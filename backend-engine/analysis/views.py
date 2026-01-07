from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.models import User
from .serializers import (
    GameUploadSerializer,
    RegisterSerializer,
    GameSummarySerializer,
    GameAnalysisSerializer,
)
from django.core.exceptions import ObjectDoesNotExist
from django.utils.encoding import DjangoUnicodeDecodeError
from analysis.tasks import analyze_game, aggregate_game_stats
from analysis.models import Game
from celery import chain


class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "User registered successfully"},
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyEmailView(APIView):
    def get(self, request, uidb64, token):
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
        except (ObjectDoesNotExist, DjangoUnicodeDecodeError):
            return Response(
                {"error": "Invalid verification link"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if default_token_generator.check_token(user, token):
            user.is_active = True
            user.save()
            return Response(
                {"message": "Email verified successfully"}, status=status.HTTP_200_OK
            )
        return Response(
            {"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST
        )


class GameUploadView(APIView):
    def post(self, request):
        serializer = GameUploadSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)

        game = serializer.save()
        chain(
            analyze_game.s(game.id),
            aggregate_game_stats.s(),
        ).delay()

        return Response(
            {
                "message": "Game uploaded successfully",
                "game_id": game.id,
                "analyzed": game.analyzed,
            },
            status=status.HTTP_201_CREATED,
        )


class GameSummaryView(APIView):
    def get(self, request, game_id):
        try:
            game = Game.objects.get(id=game_id, user=request.user)
        except Game.DoesNotExist:
            return Response(
                {"error": "Game not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = GameSummarySerializer(game)
        return Response(serializer.data, status=status.HTTP_200_OK)


class GameAnalysisView(APIView):
    def get(self, request, game_id):
        try:
            if request.user and request.user.is_authenticated:
                game = Game.objects.get(id=game_id, user=request.user)
            else:
                game = Game.objects.get(id=game_id)
        except Game.DoesNotExist:
            return Response(
                {"error": "Game not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not game.analyzed:
            return Response(
                {"status": "processing"},
                status=status.HTTP_202_ACCEPTED,
            )

        serializer = GameAnalysisSerializer(game)
        return Response(serializer.data, status=status.HTTP_200_OK)
