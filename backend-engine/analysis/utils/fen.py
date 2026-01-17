import chess.pgn
from io import StringIO


def fen_from_pgn(pgn: str):
    pgn_io = StringIO(pgn)
    game = chess.pgn.read_game(pgn_io)
    board = game.board()
    board_state = []
    for move in game.mainline_moves():
        fen = board.fen()
        each_move = {
            "move_number": board.fullmove_number,
            "ply": board.ply(),
            "player": "White" if board.turn else "Black",
            "uci": move.uci(),
            "san": board.san(move),
            "fen_before": fen,
        }
        board.push(move)
        each_move["fen_after"] = board.fen()
        board_state.append(each_move)
    return board_state
