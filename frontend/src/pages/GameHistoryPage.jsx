import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { User, Loader2 } from "lucide-react";

export default function GameHistoryPage() {
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/games/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setGames(data);
        }
      } catch (err) {
        console.error("Failed to fetch games", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchGames();
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-green-500 h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 bg-gray-950 min-h-screen">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white/90">Game History</h2>
        <p className="text-gray-400">View your analyzed games history.</p>
      </div>

      <div className="rounded-md border border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm text-left">
            <thead className="[&_tr]:border-b [&_tr]:border-gray-800">
              <tr className="border-b transition-colors hover:bg-gray-800/50 data-[state=selected]:bg-gray-800">
                <th className="h-12 px-4 align-middle font-medium text-gray-400">Players</th>
                <th className="h-12 px-4 align-middle font-medium text-gray-400">Result</th>
                <th className="h-12 px-4 align-middle font-medium text-gray-400">Accuracy</th>
                <th className="h-12 px-4 align-middle font-medium text-gray-400">Status</th>
                <th className="h-12 px-4 align-middle font-medium text-gray-400 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {games.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500">
                    No games found. Upload one to start!
                  </td>
                </tr>
              ) : (
                games.map((game) => (
                  <tr
                    key={game.id}
                    className="border-b border-gray-800/50 transition-colors hover:bg-gray-800/50"
                  >
                    <td className="p-4 align-middle font-medium text-white">
                      <div className="flex flex-col">
                        <span className="flex items-center gap-2">
                          <User className="h-3 w-3 text-gray-400" /> {game.white_player || "White"}
                        </span>
                        <span className="flex items-center gap-2">
                          <User className="h-3 w-3 text-gray-400" /> {game.black_player || "Black"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 align-middle text-gray-300">{game.result || "?"}</td>
                    <td className="p-4 align-middle">
                      <div className="flex gap-4">
                        <span className="text-white">
                          W: {game.white_accuracy ? `${game.white_accuracy}%` : "-"}
                        </span>
                        <span className="text-white">
                          B: {game.black_accuracy ? `${game.black_accuracy}%` : "-"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          game.status === "ready"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-yellow-500/10 text-yellow-500"
                        }`}
                      >
                        {game.status}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <Link
                        to={`/analysis?game=${game.id}`}
                        className="text-blue-500 hover:text-blue-400 hover:underline"
                      >
                        Analyze
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
