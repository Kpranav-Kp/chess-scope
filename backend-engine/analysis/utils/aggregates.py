from django.db.models import Avg, Max, Min
from analysis.models import Move
from django.db import models


def aggregate_game(game):
    qs = Move.objects.filter(game=game)

    agg = qs.aggregate(
        avg_cp_loss=Avg("centipawn_loss"),
        max_advantage=Max("evaluation"),
        min_advantage=Min("evaluation"),
    )

    stats = {
        "avg_cp_loss": agg["avg_cp_loss"],
        "max_advantage": agg["max_advantage"],
        "min_advantage": agg["min_advantage"],
    }

    classifications = qs.values("classification").annotate(count=models.Count("id"))
    counts = {c["classification"]: c["count"] for c in classifications}

    return stats, counts
