MATE_SCORE = 1000000


def normalize_evaluation(evaluation: dict) -> float:
    if evaluation["type"] == "cp":
        return float(evaluation["value"])

    if evaluation["type"] == "mate":
        value = evaluation["value"]
        return float(MATE_SCORE) if value > 0 else -float(MATE_SCORE)

    return 0


def calculate_centipawn_loss(best_eval: float, played_eval: float) -> float:
    loss = best_eval - played_eval
    return max(0, loss)
