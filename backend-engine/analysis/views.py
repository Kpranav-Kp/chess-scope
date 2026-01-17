from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.models import User
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.db.models import Q
from django.core.exceptions import ObjectDoesNotExist
from django.utils.encoding import DjangoUnicodeDecodeError
from django.http import StreamingHttpResponse
import time
import json
from celery import chain
from rest_framework import renderers
from rest_framework_simplejwt.tokens import AccessToken, TokenError

from analysis.tasks import analyze_game, aggregate_game_stats
from analysis.models import Game
from .serializers import (
    GameUploadSerializer,
    RegisterSerializer,
    GameSummarySerializer,
    GameAnalysisSerializer,
)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["username"] = user.username
        return token

    def validate(self, attrs):
        username_or_email = attrs.get("username")
        password = attrs.get("password")

        if username_or_email and password:
            user = User.objects.filter(
                Q(username=username_or_email) | Q(email=username_or_email)
            ).first()

            if user and user.check_password(password):
                attrs["username"] = user.username

        return super().validate(attrs)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


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


class GameListView(APIView):
    def get(self, request):
        if not request.user.is_authenticated:
            return Response(
                {"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED
            )

        games = Game.objects.filter(user=request.user).order_by("-created_at")
        # Reuse GameSummarySerializer for list items for now, or create a lighter one
        serializer = GameSummarySerializer(games, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


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


class ServerSentEventRenderer(renderers.BaseRenderer):
    media_type = "text/event-stream"
    format = "txt"

    def render(self, data, accepted_media_type=None, renderer_context=None):
        return data


class GameAnalysisStreamView(APIView):
    renderer_classes = [ServerSentEventRenderer]

    def get(self, request, game_id):
        user = request.user

        # If not authenticated via header, try query param
        if not user.is_authenticated:
            token_str = request.GET.get("token")
            if token_str:
                try:
                    token = AccessToken(token_str)
                    user = User.objects.get(id=token["user_id"])
                except (TokenError, User.DoesNotExist):
                    pass  # user remains AnonymousUser

        # Verify permissions
        try:
            if user.is_authenticated:
                game = Game.objects.get(id=game_id, user=user)
            else:
                # If still not authenticated or game belongs to user but no auth provided
                # For now, allow public access if logic permits, BUT user's code had "else: Game.objects.get(id=game_id)"
                # which implies public access was allowed or checking purely by ID.
                # We keep that logic but we prefer authenticated access for user's own games.
                game = Game.objects.get(id=game_id)
        except Game.DoesNotExist:
            return Response({"error": "Not found"}, status=404)

        def event_stream():
            # If already analyzed, send immediately and close
            if game.analyzed:
                serializer = GameAnalysisSerializer(game)
                yield f"data: {json.dumps(serializer.data)}\n\n"
                return

            while True:
                game.refresh_from_db()

                if game.analyzed:
                    serializer = GameAnalysisSerializer(game)
                    yield f"data: {json.dumps(serializer.data)}\n\n"
                    break

                yield ": keep-alive\n\n"
                time.sleep(2)

        return StreamingHttpResponse(event_stream(), content_type="text/event-stream")
