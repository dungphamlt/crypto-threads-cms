"use client";

import type React from "react";

import { useState } from "react";
import { authService } from "@/services/authService";
import Cookies from "js-cookie";
import { Loader2, Lock, User } from "lucide-react";
import Link from "next/link";

interface LoginResponse {
  access_token: string;
  message?: string;
}

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authService.login(formData);

      if (
        response.success &&
        response.data &&
        "access_token" in (response.data as LoginResponse)
      ) {
        const { access_token } = response.data as LoginResponse;
        Cookies.set("token", access_token, {
          expires: 3 / 24,
        });

        // Use window.location.replace for immediate navigation
        window.location.replace("/posts/all-posts");
        return; // Exit early to prevent setIsLoading(false)
      } else {
        setError(
          response.message || "Invalid username or password. Please try again."
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(
          error.message.includes("fetch")
            ? "Network error. Please check your connection."
            : "Login failed. Please try again."
        );
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-background">
      <div className="absolute inset-0">
        {/* Gradient background overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10" />

        {/* Floating geometric elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/20 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-40 right-32 w-48 h-48 bg-gradient-to-br from-accent/15 to-secondary/20 rounded-full blur-2xl animate-pulse delay-1000" />
        <div className="absolute bottom-32 left-32 w-40 h-40 bg-gradient-to-br from-secondary/10 to-primary/15 rounded-full blur-xl animate-pulse delay-2000" />
        <div className="absolute bottom-20 right-20 w-36 h-36 bg-gradient-to-br from-primary/8 to-accent/12 rounded-full blur-xl animate-pulse delay-500" />

        {/* Subtle geometric shapes */}
        <div className="absolute top-1/4 left-1/4 w-16 h-16 border border-primary/20 rounded-lg transform rotate-12 animate-pulse delay-1500" />
        <div className="absolute top-3/4 right-1/4 w-20 h-20 border border-accent/25 rounded-lg transform -rotate-12 animate-pulse delay-3000" />

        {/* Refined grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgb(31, 65, 114, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgb(31, 65, 114, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      <div className="w-full max-w-lg relative z-10 bg-card/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-border/50 overflow-hidden">
        {/* Header section with improved styling */}
        <div className="text-center py-6 px-8 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="mx-auto w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mb-4 shadow-xl">
            <Lock className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
            Welcome
          </h1>
          <p className="text-muted-foreground text-lg font-medium">
            Crypto Thread CMS
          </p>
        </div>

        <div className="px-8 pb-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="text-sm font-semibold text-foreground block"
              >
                Username
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="w-full pl-12 pr-4 h-12 border-2 border-border rounded-xl focus:outline-none focus:ring  focus:border-primary transition-all duration-200 bg-input text-foreground placeholder:text-muted-foreground text-base font-medium shadow-sm hover:border-primary/50"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-foreground block"
              >
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full pl-12 pr-4 h-12 border-2 border-border rounded-xl focus:outline-none focus:ring focus:border-primary transition-all duration-200 bg-input text-foreground placeholder:text-muted-foreground text-base font-medium shadow-sm hover:border-primary/50"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border-2 border-destructive/20 rounded-xl p-4 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-center space-x-2">
                  <svg
                    className="w-5 h-5 text-destructive flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-destructive text-red-500 font-medium text-sm text-center">
                    {error}
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-bold text-base transition-all duration-200 shadow-lg hover:shadow-xl rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-[1.02] active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                className="text-gray-500 hover:text-gray-600 font-medium text-sm transition-colors duration-200 underline-offset-4 hover:underline"
              >
                Forgot your password?
              </button>
              <p className="text-muted-foreground text-sm">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="text-secondary hover:text-secondary/80 font-medium transition-colors duration-200 underline-offset-4 hover:underline"
                >
                  Create account
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
