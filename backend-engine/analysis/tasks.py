from celery import shared_task
from .models import Game, Move
from .utils.fen import fen_from_pgn
from .utils.stockfish import get_stockfish
import logging
from .utils.classification import classify_move
from .utils.evaluation import calculate_centipawn_loss, normalize_evaluation
from .utils.meta import accuracy


logger = logging.getLogger(__name__)


@shared_task(bind=True)
def analyze_game(self, game_id):
    game = Game.objects.get(id=game_id)

    engine = get_stockfish()
    moves = fen_from_pgn(game.pgn)
    move_objects = []

    for move in moves:
        engine.set_fen_position(move["fen_before"])

        best_move = engine.get_best_move()
        engine.make_moves_from_current_position([best_move])
        best_eval = normalize_evaluation(engine.get_evaluation())

        engine.set_fen_position(move["fen_before"])

        engine.make_moves_from_current_position([move["uci"]])
        played_eval = normalize_evaluation(engine.get_evaluation())

        cp_loss = calculate_centipawn_loss(best_eval, played_eval)
        classification = classify_move(cp_loss)

        move_objects.append(
            Move(
                game=game,
                ply=move["ply"],
                move_number=move["move_number"],
                player=move["player"],
                uci=move["uci"],
                fen_before=move["fen_before"],
                fen_after=move["fen_after"],
                evaluation=played_eval,
                best_move=best_move,
                centipawn_loss=cp_loss,
                classification=classification,
            )
        )
    Move.objects.bulk_create(move_objects)

    game.accuracy = accuracy(moves)

    game.analyzed = True
    game.save()

    return {
        "status": "completed",
        "game_id": game.id,
        "moves_analyzed": len(moves),
    }
