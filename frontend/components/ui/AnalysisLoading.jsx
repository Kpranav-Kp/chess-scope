import { Loader2 } from "lucide-react";

export default function AnalysisLoading() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center space-y-4">
            <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 opacity-75 blur animate-pulse" />
                <div className="relative rounded-full bg-gray-900 p-4">
                    <Loader2 className="h-12 w-12 animate-spin text-green-500" />
                </div>
            </div>
            <h2 className="text-xl font-semibold text-white">Analyzing Game...</h2>
            <p className="text-gray-400">Stockfish is calculating the best moves</p>
        </div>
    );
}
