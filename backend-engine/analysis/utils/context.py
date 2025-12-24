from dataclasses import dataclass
import chess


@dataclass
class MoveContext:
    material_delta: int
    eval_before: float
    eval_after: float
    only_move: bool
    phase: str
    num_legal_moves: int


PIECE_VALUES = {
    chess.PAWN: 1,
    chess.KNIGHT: 3,
    chess.BISHOP: 3,
    chess.ROOK: 5,
    chess.QUEEN: 9,
}


def material_balance(board: chess.Board) -> int:
    balance = 0
    for piece, value in PIECE_VALUES.items():
        balance += len(board.pieces(piece, chess.WHITE)) * value
        balance -= len(board.pieces(piece, chess.BLACK)) * value
    return balance


def game_phase(ply: int) -> str:
    if ply < 20:
        return "opening"
    elif ply < 60:
        return "middlegame"
    return "endgame"
