from io import StringIO
import chess.pgn
from django.db.models import Sum


def accuracy(qs):
    total_loss = qs.aggregate(total=Sum("centipawn_loss"))["total"] or 0

    max_loss = qs.count() * 300
    return round(100 * (1 - total_loss / max_loss), 2)


def extract_pgn_metadata(pgn: str) -> dict:
    game = chess.pgn.read_game(StringIO(pgn))

    if game is None:
        return {}

    headers = game.headers

    return {
        "event": headers.get("Event"),
        "white_player": headers.get("White"),
        "black_player": headers.get("Black"),
        "result": headers.get("Result"),
    }
