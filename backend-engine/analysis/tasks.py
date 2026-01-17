import logging
import chess
from celery import shared_task
from django.db import transaction
from .models import Game, Move
from .utils.fen import fen_from_pgn
from .utils.stockfish import get_stockfish
from .utils.context import MoveContext, material_balance, game_phase
from .utils.classification import classify_move
from .utils.evaluation import (
    calculate_centipawn_loss,
    normalize_evaluation,
    normalize_top_move,
)
from .utils.accuracy import move_accuracy, player_accuracy
from .utils.aggregates import aggregate_moves
from analysis.utils.complexity import position_complexity, select_engine_depth


logger = logging.getLogger(__name__)
ONLY_MOVE_THRESHOLD = 100


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=10,
    retry_kwargs={"max_retries": 3},
)
def analyze_game(self, game_id):
    try:
        game = Game.objects.get(id=game_id)
    except Game.DoesNotExist:
        logger.warning("Game %s does not exist", game_id)
        return None

    if game.analyzed:
        return game.id

    engine = get_stockfish()
    moves = fen_from_pgn(game.pgn)

    move_objects = []
    prev_board = None

    for move in moves:
        fen_before = move["fen_before"]
        fen_after = move["fen_after"]

        board_before = prev_board or chess.Board(fen_before)
        board_after = chess.Board(fen_after)
        prev_board = board_after

        engine.set_fen_position(fen_before)

        top_moves = engine.get_top_moves(2)
        if not top_moves:
            continue

        best_entry = top_moves[0]
        best_move = best_entry["Move"]
        best_eval = normalize_top_move(best_entry)

        second_eval = normalize_top_move(top_moves[1]) if len(top_moves) > 1 else None

        only_move = (
            second_eval is None or (best_eval - second_eval) >= ONLY_MOVE_THRESHOLD
        )

        eval_before = best_eval
        material_before = material_balance(board_before)
        material_after = material_balance(board_after)
        material_delta = material_after - material_before

        num_legal_moves = board_before.legal_moves.count()
        phase = game_phase(move["ply"])

        complexity = position_complexity(
            num_legal_moves=num_legal_moves,
            material_delta=material_delta,
            eval_before=eval_before,
            only_move=only_move,
        )

        depth = select_engine_depth(phase, complexity)
        engine.set_depth(depth)

        try:
            engine.make_moves_from_current_position([move["uci"]])
        except ValueError:
            logger.warning("Illegal move %s in game %s", move["uci"], game.id)
            continue

        eval_after = normalize_evaluation(engine.get_evaluation())
        cp_loss = calculate_centipawn_loss(best_eval, eval_after)

        context = MoveContext(
            material_delta=material_delta,
            eval_before=eval_before,
            eval_after=eval_after,
            only_move=only_move,
            phase=phase,
            num_legal_moves=num_legal_moves,
        )

        classification = classify_move(cp_loss, context)
        accuracy_score = move_accuracy(cp_loss)

        neg_game_changing = (
            classification in {"blunder", "mistake"}
            and (eval_before - eval_after) >= 1.5
        )

        best_move_fen = None
        if neg_game_changing:
            best_board = chess.Board(fen_before)
            try:
                best_board.push_uci(best_move)
                best_move_fen = best_board.fen()
            except ValueError as e:
                logger.warning(
                    "Failed to apply best move %s on FEN %s (game=%s, ply=%s): %s",
                    best_move,
                    fen_before,
                    game.id,
                    move["ply"],
                    str(e),
                )

        move_objects.append(
            Move(
                game=game,
                ply=move["ply"],
                move_number=move["move_number"],
                player=move["player"],
                uci=move["uci"],
                san=move["san"],
                fen_before=fen_before,
                fen_after=fen_after,
                evaluation=eval_after,
                best_move=best_move,
                best_move_fen=best_move_fen,
                centipawn_loss=cp_loss,
                classification=classification,
                accuracy_score=accuracy_score,
                neg_game_changing=neg_game_changing,
            )
        )

    with transaction.atomic():
        Move.objects.bulk_create(move_objects)
        game.analyzed = True
        game.save(update_fields=["analyzed"])

    return game.id


@shared_task
def aggregate_game_stats(game_id):
    game = Game.objects.get(id=game_id)

    all_moves = Move.objects.filter(game=game)
    white_moves = all_moves.filter(player="White")
    black_moves = all_moves.filter(player="Black")

    global_stats, _ = aggregate_moves(all_moves)
    _, white_counts = aggregate_moves(white_moves)
    _, black_counts = aggregate_moves(black_moves)

    game.avg_cp_loss = global_stats["avg_cp_loss"]
    game.max_advantage = global_stats["max_advantage"]
    game.min_advantage = global_stats["min_advantage"]

    game.white_accuracy = player_accuracy(white_moves)
    game.black_accuracy = player_accuracy(black_moves)

    for k, v in white_counts.items():
        setattr(game, f"white_num_{k}", v)

    for k, v in black_counts.items():
        setattr(game, f"black_num_{k}", v)

    game.save()

    return {
        "game_id": game.id,
        "moves": all_moves.count(),
        "status": "aggregated",
    }
