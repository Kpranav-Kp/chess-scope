from celery import shared_task
from django.db import transaction
from .models import Game, Move
from .utils.fen import fen_from_pgn
from .utils.stockfish import get_stockfish
from .utils.classification import classify_move
from .utils.evaluation import (
    calculate_centipawn_loss,
    normalize_evaluation,
    normalize_top_move,
)
from .utils.context import (
    MoveContext,
    material_balance,
    game_phase,
)
from .utils.aggregates import aggregate_game
from .utils.meta import accuracy
import chess
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True)
def analyze_game(self, game_id):
    game = Game.objects.get(id=game_id)
    if game.analyzed:
        return game.id

    engine = get_stockfish()
    moves = fen_from_pgn(game.pgn)

    move_objects = []
    prev_board = None

    for move in moves:
        fen_before = move["fen_before"]
        fen_after = move["fen_after"]

        engine.set_fen_position(fen_before)
        top_moves = engine.get_top_moves(2)

        best_entry = top_moves[0]
        best_move = best_entry["Move"]
        best_eval = normalize_top_move(best_entry)

        second_eval = normalize_top_move(top_moves[1]) if len(top_moves) > 1 else None

        only_move = second_eval is None or (best_eval - second_eval) >= 100

        eval_before = normalize_evaluation(engine.get_evaluation())

        engine.set_fen_position(fen_before)
        engine.make_moves_from_current_position([move["uci"]])
        eval_after = normalize_evaluation(engine.get_evaluation())

        if prev_board is None:
            board_before = chess.Board(fen_before)
        else:
            board_before = prev_board

        num_legal_moves = board_before.legal_moves.count()
        material_before = material_balance(board_before)

        board_after = chess.Board(fen_after)
        material_after = material_balance(board_after)
        prev_board = board_after

        cp_loss = calculate_centipawn_loss(best_eval, eval_after)

        context = MoveContext(
            material_delta=material_after - material_before,
            eval_before=eval_before,
            eval_after=eval_after,
            only_move=only_move,
            phase=game_phase(move["ply"]),
            num_legal_moves=num_legal_moves,
        )

        classification = classify_move(cp_loss, context)

        move_objects.append(
            Move(
                game=game,
                ply=move["ply"],
                move_number=move["move_number"],
                player=move["player"],
                uci=move["uci"],
                fen_before=fen_before,
                fen_after=fen_after,
                evaluation=eval_after,
                best_move=best_move,
                centipawn_loss=cp_loss,
                classification=classification,
            )
        )

    with transaction.atomic():
        Move.objects.bulk_create(move_objects)
        game.accuracy = accuracy(Move.objects.filter(game=game))
        game.analyzed = True
        game.save()

    return game.id


@shared_task
def aggregate_game_stats(game_id):
    game = Game.objects.get(id=game_id)

    stats, counts = aggregate_game(game)

    game.avg_cp_loss = stats["avg_cp_loss"]
    game.max_advantage = stats["max_advantage"]
    game.min_advantage = stats["min_advantage"]

    game.num_best = counts.get("best", 0)
    game.num_good = counts.get("good", 0)
    game.num_excellent = counts.get("excellent", 0)
    game.num_inaccuracy = counts.get("inaccuracy", 0)
    game.num_mistake = counts.get("mistake", 0)
    game.num_blunder = counts.get("blunder", 0)
    game.num_great = counts.get("great", 0)
    game.num_brilliant = counts.get("brilliant", 0)

    game.save()

    return {
        "game_id": game.id,
        "moves": Move.objects.filter(game=game).count(),
        "status": "aggregated",
    }
