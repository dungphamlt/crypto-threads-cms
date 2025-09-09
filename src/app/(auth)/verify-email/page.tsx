"use client";

import type React from "react";
import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/services/authService";
import { Loader2, Mail, Shield, RotateCcw } from "lucide-react";
import Link from "next/link";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Email is required. Please go back to registration.");
      return;
    }

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP code");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.verifyEmail({
        email,
        otp,
      });

      if (response.success) {
        setSuccess("Email verified successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(response.message || "Invalid OTP code. Please try again.");
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(
          error.message.includes("fetch")
            ? "Network error. Please check your connection."
            : "Verification failed. Please try again."
        );
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      console.error("Verify email error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      setError("Email is required. Please go back to registration.");
      return;
    }

    setError("");
    setSuccess("");
    setIsResending(true);

    try {
      const response = await authService.resendOtp(email);

      if (response.success) {
        setSuccess("OTP code has been resent to your email!");
        setCountdown(60); // 60 second countdown
      } else {
        setError(response.message || "Failed to resend OTP. Please try again.");
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(
          error.message.includes("fetch")
            ? "Network error. Please check your connection."
            : "Failed to resend OTP. Please try again."
        );
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      console.error("Resend OTP error:", error);
    } finally {
      setIsResending(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
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
            <Shield className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
            Verify Email
          </h1>
          <p className="text-muted-foreground text-base font-medium">
            We sent a verification code to
          </p>
          <p className="text-primary font-semibold text-base mt-1">{email}</p>
        </div>

        <div className="px-8 pb-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="otp"
                className="text-sm font-semibold text-foreground block"
              >
                Verification Code
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  maxLength={6}
                  className="w-full pl-12 pr-4 h-12 border-2 border-border rounded-xl focus:outline-none focus:ring-4 focus:ring-ring focus:border-primary transition-all duration-200 bg-input text-foreground placeholder:text-muted-foreground text-base font-medium shadow-sm hover:border-primary/50 text-center tracking-widest"
                  placeholder="000000"
                  value={otp}
                  onChange={handleOtpChange}
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Enter the 6-digit code sent to your email
              </p>
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

            {success && (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-center space-x-2">
                  <svg
                    className="w-5 h-5 text-green-600 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-green-700 font-medium text-sm text-center">
                    {success}
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-bold text-base transition-all duration-200 shadow-lg hover:shadow-xl rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-[1.02] active:scale-[0.98]"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </button>

            <div className="text-center pt-2 space-y-2">
              <p className="text-muted-foreground text-sm">
                Didn&apos;t receive the code?
              </p>
              <button
                type="button"
                onClick={handleResendOtp}
                className="text-secondary hover:text-secondary/80 font-medium text-sm transition-colors duration-200 underline-offset-4 hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
                disabled={isResending || countdown > 0}
              >
                {isResending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Resending...
                  </>
                ) : countdown > 0 ? (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Resend in {countdown}s
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Resend Code
                  </>
                )}
              </button>
            </div>

            <div className="text-center pt-2 space-y-2">
              <p className="text-muted-foreground text-sm">
                Already verified?{" "}
                <Link
                  href="/login"
                  className="text-secondary hover:text-secondary/80 font-medium transition-colors duration-200 underline-offset-4 hover:underline"
                >
                  Sign in
                </Link>
              </p>

              <p className="text-muted-foreground text-sm">
                Wrong email?{" "}
                <Link
                  href="/register"
                  className="text-secondary hover:text-secondary/80 font-medium transition-colors duration-200 underline-offset-4 hover:underline"
                >
                  Go back to registration
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-background">
      <div className="w-full max-w-lg relative z-10 bg-card/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-border/50 overflow-hidden">
        <div className="text-center py-6 px-8">
          <div className="mx-auto w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mb-4 shadow-xl">
            <Shield className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
            Verify Email
          </h1>
          <div className="flex items-center justify-center mt-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyEmailForm />
    </Suspense>
  );
}
