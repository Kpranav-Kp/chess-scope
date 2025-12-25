from django.db.models import Avg, Max, Min, Count


def aggregate_moves(qs):
    stats = qs.aggregate(
        avg_cp_loss=Avg("centipawn_loss"),
        max_advantage=Max("evaluation"),
        min_advantage=Min("evaluation"),
    )

    counts = {
        row["classification"]: row["count"]
        for row in qs.values("classification").annotate(count=Count("id"))
    }

    return stats, counts
