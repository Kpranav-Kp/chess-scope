export default function GameHistoryPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Game History</h1>
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-gray-900 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">White</th>
              <th className="px-6 py-4">Black</th>
              <th className="px-6 py-4">Result</th>
              <th className="px-6 py-4">Moves</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="hover:bg-gray-800/50">
                <td className="px-6 py-4">2023-10-{10 + i}</td>
                <td className="px-6 py-4 text-white">Player One</td>
                <td className="px-6 py-4 text-white">Player Two</td>
                <td className="px-6 py-4">
                  <span className="inline-flex rounded-full bg-green-900/30 px-2 py-1 text-xs font-semibold text-green-500">
                    1-0
                  </span>
                </td>
                <td className="px-6 py-4">42</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
