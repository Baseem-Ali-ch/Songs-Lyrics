"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Eye, EyeOff } from "lucide-react";
import { adminCredentials } from "@/lib/data";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate loading
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (
      username === adminCredentials.username &&
      password === adminCredentials.password
    ) {
      localStorage.setItem("adminLoggedIn", "true");
      router.push("/admin/dashboard");
    } else {
      setError("Invalid credentials. Please try again.");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="vintage-border p-6 bg-vintage-cream rounded-lg mb-6">
            <h1
              className="text-3xl font-bold text-vintage-brown mb-2"
              style={{ fontFamily: "Georgia, serif" }}
            >
              🔐 Admin Portal
            </h1>
            <p className="text-vintage-brown typewriter-text">
              Authorized Personnel Only
            </p>
          </div>
        </div>

        {/* Login Form */}
        <div className="vintage-card p-8 rounded-lg">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-vintage-brown font-medium mb-2">
                Username
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-vintage-brown"
                  size={20}
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="vintage-input w-full pl-10 pr-4 py-3 rounded-lg"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-vintage-brown font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-vintage-brown"
                  size={20}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="vintage-input w-full pl-10 pr-12 py-3 rounded-lg"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-vintage-brown hover:text-vintage-gold"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="vintage-button w-full py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Authenticating..." : "Login"}
            </button>
          </form>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <button
              onClick={() => router.push("/")}
              className="text-vintage-brown hover:text-vintage-gold underline"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
