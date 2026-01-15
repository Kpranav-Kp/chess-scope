export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-48 rounded-xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm"
          >
            <div className="h-full w-full animate-pulse rounded bg-gray-800/50"></div>
          </div>
        ))}
      </div>
      <p className="mt-8 text-gray-500">Dashboard functionality coming soon.</p>
    </div>
  );
}
