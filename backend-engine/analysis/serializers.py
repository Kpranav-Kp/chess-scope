from django.contrib.auth.models import User
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
import re
from .models import Game, Move
from .utils.meta import extract_pgn_metadata


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

    def create(self, validated_data):
        request = self.context["request"]
        pgn = validated_data["pgn"]

        metadata = extract_pgn_metadata(pgn)

        game = Game.objects.create(
            user=request.user,
            pgn=pgn,
            event=metadata.get("event"),
            white_player=metadata.get("white_player"),
            black_player=metadata.get("black_player"),
            result=metadata.get("result"),
        )

        return game


class MoveAnalysisSerializer(serializers.ModelSerializer):
    show_best_move = serializers.SerializerMethodField()
    explanation_available = serializers.SerializerMethodField()
    explanation_type = serializers.SerializerMethodField()
    is_key_moment = serializers.SerializerMethodField()

    class Meta:
        model = Move
        fields = [
            "id",
            "ply",
            "move_number",
            "player",
            "uci",
            "san",
            "fen_before",
            "fen_after",
            "evaluation",
            "best_move",
            "best_move_fen",
            "neg_game_changing",
            "classification",
            "show_best_move",
            "explanation_available",
            "explanation_type",
            "is_key_moment",
        ]

    def get_show_best_move(self, obj):
        if not obj.best_move_fen:
            return False
        return obj.classification not in {"best", "great", "brilliant"}

    def get_explanation_available(self, obj):
        return obj.neg_game_changing

    def get_explanation_type(self, obj):
        if not obj.neg_game_changing:
            return None
        return obj.classification

    def get_is_key_moment(self, obj):
        return obj.neg_game_changing


class GameSummarySerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    white_counts = serializers.SerializerMethodField()
    black_counts = serializers.SerializerMethodField()

    class Meta:
        model = Game
        fields = [
            "id",
            "status",
            "white_player",
            "black_player",
            "result",
            "white_accuracy",
            "black_accuracy",
            "white_counts",
            "black_counts",
        ]

    def get_status(self, obj):
        return "ready" if obj.analyzed else "processing"

    def get_white_counts(self, obj):
        if not obj.analyzed:
            return None

        return {
            "best": obj.white_num_best,
            "excellent": obj.white_num_excellent,
            "good": obj.white_num_good,
            "inaccuracy": obj.white_num_inaccuracy,
            "mistake": obj.white_num_mistake,
            "blunder": obj.white_num_blunder,
            "brilliant": obj.white_num_brilliant,
            "great": obj.white_num_great,
        }

    def get_black_counts(self, obj):
        if not obj.analyzed:
            return None

        return {
            "best": obj.black_num_best,
            "excellent": obj.black_num_excellent,
            "good": obj.black_num_good,
            "inaccuracy": obj.black_num_inaccuracy,
            "mistake": obj.black_num_mistake,
            "blunder": obj.black_num_blunder,
            "brilliant": obj.black_num_brilliant,
            "great": obj.black_num_great,
        }


class GameAnalysisSerializer(serializers.ModelSerializer):
    moves = serializers.SerializerMethodField()

    class Meta:
        model = Game
        fields = [
            "id",
            "white_player",
            "black_player",
            "result",
            "white_accuracy",
            "black_accuracy",
            "moves",
        ]

    def get_moves(self, obj):
        qs = obj.moves.all().order_by("ply")
        return MoveAnalysisSerializer(qs, many=True).data
