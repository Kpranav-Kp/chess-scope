import { useState } from "react";
import { Upload, FileText, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function UploadPage() {
  const [pgn, setPgn] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { token } = useAuth();

  const cleanPGN = (rawPgn) => {
    // 1. Split lines and trim
    const lines = rawPgn
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line);

    // 2. Separate headers and moves
    const headers = [];
    const moves = [];

    lines.forEach((line) => {
      if (line.startsWith("[") && line.endsWith("]")) {
        headers.push(line);
      } else {
        moves.push(line);
      }
    });

    // 3. Reconstruct
    // Headers joined by newline
    // Moves joined by space (to ensure continuity)
    return `${headers.join("\n")}\n\n${moves.join(" ")}`;
  };

  const handleAnalysis = async (pgnContent) => {
    setIsUploading(true);
    setError("");

    try {
      const cleanedPgn = cleanPGN(pgnContent);

      const response = await fetch("http://localhost:8000/api/upload/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pgn: cleanedPgn }),
      });

      if (!response.ok) {
        throw new Error("Failed to upload game");
      }

      const data = await response.json();
      navigate(`/analysis?game=${data.game_id}`);
    } catch (error) {
      setError("Failed to upload game. Please try again.");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePasteUpload = () => {
    if (pgn.trim()) {
      handleAnalysis(pgn.trim());
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target.result) {
        handleAnalysis(event.target.result);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex h-full flex-col">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">New Analysis</h1>
        <p className="text-gray-400">
          Upload a PGN file or paste the text below to start analyzing.
        </p>
      </header>

      <div className="grid flex-1 gap-8 lg:grid-cols-2">
        {/* Paste Area */}
        <div className="flex flex-col rounded-xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm">
          <label className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <FileText className="h-5 w-5 text-green-500" />
            Paste PGN
          </label>
          <textarea
            className="flex-1 resize-none rounded-lg border border-gray-800 bg-gray-950 p-4 font-mono text-sm text-gray-300 placeholder-gray-600 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            placeholder='[Event "FIDE World Cup 2023"]&#10;[Site "Baku AZE"]&#10;[Date "2023.08.24"]&#10;...'
            value={pgn}
            onChange={(e) => setPgn(e.target.value)}
          />
          {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handlePasteUpload}
              disabled={!pgn.trim() || isUploading}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2.5 font-semibold text-white transition-all hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Start Analysis"}
              {!isUploading && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* File Upload Area */}
        <div className="flex flex-col rounded-xl border border-dotted border-gray-700 bg-gray-900/20 p-6">
          <label className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <Upload className="h-5 w-5 text-blue-500" />
            Upload File
          </label>
          <label className="flex flex-1 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-800 bg-gray-900/50 text-center transition-colors hover:border-gray-600 hover:bg-gray-800/50">
            <div className="p-8">
              {isUploading ? (
                <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-green-500" />
              ) : (
                <Upload className="mx-auto mb-4 h-12 w-12 text-gray-500" />
              )}
              <p className="mb-2 text-lg font-medium text-gray-300">Drag and drop your PGN file</p>
              <p className="text-sm text-gray-500">
                or <span className="text-green-500 hover:underline">browse files</span>
              </p>
              <input
                type="file"
                className="hidden"
                accept=".pgn"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
