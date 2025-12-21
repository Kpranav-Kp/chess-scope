from django.db import models
from django.contrib.auth.models import User


class Game(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="games")

    pgn = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    analyzed = models.BooleanField(default=False)
    accuracy = models.FloatField(null=True)

    result = models.CharField(max_length=10, blank=True, null=True)
    white_player = models.CharField(max_length=100, blank=True, null=True)
    black_player = models.CharField(max_length=100, blank=True, null=True)
    event = models.CharField(max_length=200, blank=True, null=True)

    def __str__(self):
        return f"Game {self.id} ({self.user.username})"


class Move(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name="moves")
    ply = models.IntegerField()
    move_number = models.IntegerField()
    player = models.CharField(max_length=6)
    uci = models.CharField(max_length=10)
    fen_before = models.CharField(max_length=150)
    fen_after = models.CharField(max_length=150)
    evaluation = models.FloatField(null=True)
    best_move = models.CharField(max_length=20, null=True)
    centipawn_loss = models.FloatField(null=True)
    classification = models.CharField(max_length=20, null=True)
