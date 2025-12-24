from stockfish import Stockfish
from django.conf import settings


def get_stockfish():
    engine = Stockfish(
        path=settings.STOCKFISH_PATH,
        parameters={
            "Threads": 1,
            "MultiPV": 2,
            "Hash": 128,
        },
    )

    if not engine.is_fen_valid(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    ):
        raise RuntimeError("Stockfish engine failed to initialize")

    engine.set_depth(18)

    return engine
