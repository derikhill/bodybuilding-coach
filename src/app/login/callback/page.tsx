"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";

export default function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      console.error("Password reset error:", error.message);
      setMessage("Error resetting password. Try again.");
    } else {
      setMessage("Password successfully reset! Redirecting...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    }

    setLoading(false);
  };

  return (
    <div className="w-full max-w-sm mx-auto mt-12 p-6 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-slate-100 mb-4">Reset Your Password</h2>
      <form onSubmit={handlePasswordReset} className="space-y-4">
        <div>
          <label className="block text-slate-100 mb-2">New Password</label>
          <input
            type="password"
            className="w-full p-2 rounded bg-gray-700 text-slate-100"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-slate-100 mb-2">Confirm Password</label>
          <input
            type="password"
            className="w-full p-2 rounded bg-gray-700 text-slate-100"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded"
          disabled={loading}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
      {message && <p className="mt-4 text-center text-slate-100">{message}</p>}
    </div>
  );
}
