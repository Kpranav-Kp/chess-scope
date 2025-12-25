def classify_move(cp_loss, ctx):
    eval_gain = ctx.eval_after - ctx.eval_before

    if cp_loss <= 15:
        base = "best"
    elif cp_loss <= 30:
        base = "excellent"
    elif cp_loss <= 60:
        base = "good"
    elif cp_loss <= 120:
        base = "inaccuracy"
    elif cp_loss <= 300:
        base = "mistake"
    else:
        base = "blunder"

    if ctx.phase == "opening":
        if base == "excellent":
            base = "best"
        elif base == "mistake":
            base = "inaccuracy"

    if (
        base in ("best", "excellent")
        and ctx.material_delta < 0
        and eval_gain > 150
        and ctx.phase in ("middlegame", "endgame")
    ):
        return "brilliant"

    if base == "best" and eval_gain > 120:
        return "great"

    return base
