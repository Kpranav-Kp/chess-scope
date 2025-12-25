def position_complexity(
    num_legal_moves: int, material_delta: int, eval_before: float, only_move: bool
) -> str:
    if only_move:
        return "simple"

    score = 0

    if num_legal_moves >= 30:
        score += 2
    elif num_legal_moves >= 20:
        score += 1

    if abs(material_delta) >= 2:
        score += 2
    elif abs(material_delta) == 1:
        score += 1

    if abs(eval_before) <= 1.0:
        score += 1
    elif abs(eval_before) >= 3.0:
        score -= 1

    return "complex" if score >= 3 else "simple"


def select_engine_depth(phase: str, complexity: str) -> int:
    if phase == "opening":
        return 12

    if phase == "middlegame":
        return 17 if complexity == "complex" else 15

    if phase == "endgame":
        return 18

    return 15
