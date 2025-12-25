from io import StringIO
import chess.pgn


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
