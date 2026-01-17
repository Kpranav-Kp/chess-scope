import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-950 text-white">
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="text-2xl font-bold tracking-wider">
          CHESS<span className="text-green-500">SCOPE</span>
        </div>
        <div className="flex gap-4">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="rounded-full bg-green-600 px-6 py-2 text-sm font-medium text-white transition-all hover:bg-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <div className="mb-8 inline-flex items-center rounded-full border border-gray-800 bg-gray-900/50 px-3 py-1 text-sm text-gray-400 backdrop-blur-sm">
          <span className="mr-2 flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Next Gen Chess Analysis
        </div>

        <h1 className="mb-6 max-w-4xl text-5xl font-extrabold leading-tight tracking-tight sm:text-7xl">
          Master Your Game with <br />
          <span className="bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
            AI-Powered Insights
          </span>
        </h1>

        <p className="mb-10 max-w-2xl text-lg text-gray-400">
          Upload your PGNs, analyze your moves with Stockfish, and visualize your progress like
          never before. Beautiful, clean, and distraction-free.
        </p>

        <div className="flex gap-4 mb-20">
          <Link
            to="/register"
            className="group flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-bold text-gray-950 transition-all hover:bg-gray-200"
          >
            Start Analyzing Free
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl text-left">
          {["Deep Stockfish Analysis", "Game History Tracking", "Advanced Visualizations"].map(
            (feature, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-800 bg-gray-900/40 p-6 backdrop-blur-sm"
              >
                <CheckCircle className="mb-4 h-8 w-8 text-green-500" />
                <h3 className="text-xl font-bold mb-2">{feature}</h3>
                <p className="text-gray-400 text-sm">
                  Experience {feature.toLowerCase()} to elevate your understanding of every
                  position.
                </p>
              </div>
            ),
          )}
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-gray-600 border-t border-gray-900 mt-20">
        © {new Date().getFullYear()} ChessScope. All rights reserved.
      </footer>
    </div>
  );
}
