def classify_move(cp_loss: float, context) -> str:
    eval_gain = context.eval_after - context.eval_before

    if context.phase == "opening":
        if cp_loss <= 15:
            return "good"
        elif cp_loss <= 40:
            return "inaccuracy"
        else:
            return "mistake"

    if context.only_move or context.num_legal_moves <= 2:
        if cp_loss <= 20:
            return "best"
        elif cp_loss <= 80:
            return "inaccuracy"
        else:
            return "mistake"

    if abs(eval_gain) < 15:
        if cp_loss <= 20:
            return "good"
        elif cp_loss <= 60:
            return "inaccuracy"
        else:
            return "mistake"

    is_sound_sacrifice = (
        context.material_delta < 0
        and eval_gain > 150
        and cp_loss < 15
        and context.phase in ("middlegame", "endgame")
    )

    if is_sound_sacrifice and context.only_move:
        return "brilliant"

    if eval_gain > 120 and context.only_move and cp_loss < 20:
        return "great"

    if cp_loss <= 10:
        return "best"
    elif cp_loss <= 20:
        return "excellent"
    elif cp_loss <= 40:
        return "good"

    if cp_loss <= 80:
        return "inaccuracy"
    elif cp_loss <= 200:
        return "mistake"
    else:
        return "blunder"
