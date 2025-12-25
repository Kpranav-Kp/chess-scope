from io import StringIO
import math
import chess.pgn


MIN_ACCURACY = 0.12


def move_accuracy(cp_loss: float) -> float:
    cp_loss = max(0.0, cp_loss)
    accuracy = math.exp(-cp_loss / 120)
    return round(max(MIN_ACCURACY, accuracy), 3)


"""def adjusted_accuracy(cp_loss: float, is_best_move: bool) -> float:
    base = move_accuracy(cp_loss)

    if is_best_move:
        base = min(1.0, base + 0.05)

    return round(base, 3)"""


def player_accuracy(moves_qs) -> float:
    scores = list(
        moves_qs.exclude(accuracy_score__isnull=True).values_list(
            "accuracy_score", flat=True
        )
    )

    if not scores:
        return 100.0

    return round(100 * sum(scores) / len(scores), 2)


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
