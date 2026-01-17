import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import api from "../utils/api";

export default function VerifyEmailPage() {
  const { uid, token } = useParams();
  const [status, setStatus] = useState("verifying"); // verifying, success, error

  useEffect(() => {
    const verify = async () => {
      try {
        await api.get(`verify-email/${uid}/${token}/`);
        setStatus("success");
      } catch (error) {
        console.error("Verification failed", error);
        setStatus("error");
      }
    };
    if (uid && token) verify();
  }, [uid, token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-md rounded-lg border border-gray-800 bg-gray-900/50 p-8 text-center backdrop-blur-sm">
        {status === "verifying" && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            <h2 className="text-xl font-bold text-white">Verifying Email...</h2>
            <p className="text-gray-400">Please wait while we verify your account.</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <h2 className="text-xl font-bold text-white">Email Verified!</h2>
            <p className="text-gray-400">Your account has been successfully verified.</p>
            <Link
              to="/login"
              className="mt-4 rounded-md bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-500 transition-colors"
            >
              Go to Login
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4">
            <XCircle className="h-12 w-12 text-red-500" />
            <h2 className="text-xl font-bold text-white">Verification Failed</h2>
            <p className="text-gray-400">The verification link is invalid or has expired.</p>
            <Link
              to="/login"
              className="mt-4 text-sm text-blue-400 hover:text-blue-300 hover:underline"
            >
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
