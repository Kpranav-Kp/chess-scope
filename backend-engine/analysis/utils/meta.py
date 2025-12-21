from io import StringIO
import chess.pgn


def accuracy(moves):
    total_loss = sum(m.centipawn_loss for m in moves)
    max_loss = len(moves) * 300
    return 100 * (1 - total_loss / max_loss)


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
