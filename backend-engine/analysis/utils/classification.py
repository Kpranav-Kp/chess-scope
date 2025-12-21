def classify_move(cp_loss: float) -> str:
    if cp_loss <= 10.0:
        return "best"
    elif cp_loss <= 20.0:
        return "excellent"
    elif cp_loss <= 30.0:
        return "good"
    elif cp_loss <= 80.0:
        return "inaccuracy"
    elif cp_loss <= 200.0:
        return "mistake"
    else:
        return "blunder"
