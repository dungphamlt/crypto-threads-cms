"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { Loader2, Lock, User, Mail, UserPlus, Camera } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    avatarUrl: "",
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

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        avatarUrl: formData.avatarUrl || undefined,
        isEmailVerified: false,
      });

      if (response.success) {
        // Redirect to email verification page with email as query param
        router.push(
          `/verify-email?email=${encodeURIComponent(formData.email)}`
        );
      } else {
        setError(response.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(
          error.message.includes("fetch")
            ? "Network error. Please check your connection."
            : "Registration failed. Please try again."
        );
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      console.error("Register error:", error);
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
            <UserPlus className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
            Create Account
          </h1>
        </div>

        <div className="px-8 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-semibold text-foreground block"
              >
                Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full pl-12 pr-4 h-12 border-2 border-border rounded-xl focus:outline-none focus:ring focus:border-primary transition-all duration-200 bg-input text-foreground placeholder:text-muted-foreground text-base font-medium shadow-sm hover:border-primary/50"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

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
                  className="w-full pl-12 pr-4 h-12 border-2 border-border rounded-xl focus:outline-none focus:ring focus:border-primary transition-all duration-200 bg-input text-foreground placeholder:text-muted-foreground text-base font-medium shadow-sm hover:border-primary/50"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="avatarUrl"
                className="text-sm font-semibold text-foreground block"
              >
                Avatar URL{" "}
                <span className="text-muted-foreground font-normal">
                  (Optional)
                </span>
              </label>
              <div className="relative group">
                <Camera className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  id="avatarUrl"
                  name="avatarUrl"
                  type="url"
                  className="w-full pl-12 pr-4 h-12 border-2 border-border rounded-xl focus:outline-none focus:ring focus:border-primary transition-all duration-200 bg-input text-foreground placeholder:text-muted-foreground text-base font-medium shadow-sm hover:border-primary/50"
                  placeholder="https://example.com/avatar.jpg"
                  value={formData.avatarUrl}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-muted-foreground ml-1">
                Provide a URL to your profile picture or leave empty for default
                avatar
              </p>
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
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-semibold text-foreground block"
              >
                Confirm Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="w-full pl-12 pr-4 h-12 border-2 border-border rounded-xl focus:outline-none focus:ring focus:border-primary transition-all duration-200 bg-input text-foreground placeholder:text-muted-foreground text-base font-medium shadow-sm hover:border-primary/50"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
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
                  <p className="text-destructive font-medium text-sm text-center">
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
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>

            <div className="text-center pt-2">
              <p className="text-muted-foreground text-sm">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-primary font-medium transition-colors duration-200 underline-offset-4 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
