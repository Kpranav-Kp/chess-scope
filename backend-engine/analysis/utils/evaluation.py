MATE_SCORE = 1000000


def normalize_evaluation(evaluation: dict) -> float:
    if evaluation["type"] == "cp":
        return float(evaluation["value"])

    if evaluation["type"] == "mate":
        value = evaluation["value"]
        return float(MATE_SCORE) if value > 0 else -float(MATE_SCORE)

    return 0.0


def normalize_top_move(entry: dict) -> float:
    cp = entry.get("Centipawn")
    if cp is not None:
        return normalize_evaluation({"type": "cp", "value": cp})

    mate = entry.get("Mate")
    if mate is not None:
        return normalize_evaluation({"type": "mate", "value": mate})

    return 0.0


def calculate_centipawn_loss(best_eval: float, played_eval: float) -> float:
    loss = best_eval - played_eval
    return max(0, loss)
