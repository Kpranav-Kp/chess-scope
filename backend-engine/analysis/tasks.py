from celery import shared_task
from .models import Game
from .utils.fen import fen_from_pgn
from .utils.stockfish import get_stockfish
import logging


logger = logging.getLogger(__name__)


@shared_task(bind=True)
def analyze_game(self, game_id):
    game = Game.objects.get(id=game_id)

    engine = get_stockfish()
    moves = fen_from_pgn(game.pgn)

    for move in moves:
        engine.set_fen_position(move["fen_before"])
        evaluation = engine.get_evaluation()
        best_move = engine.get_best_move()

        logger.info(
            f"Game {game_id} | "
            f"Move {move['move_number']} {move['player']} {move['uci']} | "
            f"Eval {evaluation} | Best {best_move}"
        )

    game.analyzed = True
    game.save()

    return {
        "status": "completed",
        "game_id": game.id,
        "moves_analyzed": len(moves),
    }
