"use client";

import { useState } from "react";
import supabase from "@/lib/supabase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // data,
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });

    if (error) {
      console.error("Error sending reset email:", error.message);
      setMessage("Error sending reset email. Try again.");
    } else {
      setMessage("Password reset email sent! Check your inbox.");
    }

    setLoading(false);
  };

  return (
    <div className="w-full max-w-sm mx-auto mt-12 p-6 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-slate-100 mb-4">Forgot Password?</h2>
      <form onSubmit={handleForgotPassword} className="space-y-4">
        <div>
          <label className="block text-slate-100 mb-2">Email Address</label>
          <input
            type="email"
            className="w-full p-2 rounded bg-gray-700 text-slate-100"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
      {message && <p className="mt-4 text-center text-slate-100">{message}</p>}
    </div>
  );
}
