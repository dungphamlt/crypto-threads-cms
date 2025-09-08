"use client";

import type React from "react";
import { cn } from "@/lib/utils";

interface OrbitalSpinnerProps {
  className?: string;
}

export function OrbitalSpinner({ className }: OrbitalSpinnerProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center w-36 h-36",
        className
      )}
      style={{
        perspective: "450px",
        perspectiveOrigin: "center center",
      }}
    >
      {/* Vòng ngoài cùng - Cyan */}
      <div
        className="absolute inset-0 border-[3px] border-cyan-400/80 rounded-full orbital-complex"
        style={
          {
            "--rotate-x": "75deg",
            "--rotate-y": "15deg",
            animationDuration: "6s", // increased from 1.5s to 4s
            transformStyle: "preserve-3d",
            filter: "drop-shadow(0 0 8px rgba(34, 211, 238, 0.4))",
          } as React.CSSProperties
        }
      />

      {/* Vòng thứ 2 - Tím */}
      <div
        className="absolute inset-2 border-[3px] border-purple-500/80 rounded-full orbital-multi"
        style={
          {
            "--rotate-x": "45deg",
            "--rotate-y": "-60deg",
            animationDuration: "5s", // increased from 1.2s to 3.5s
            transformStyle: "preserve-3d",
            filter: "drop-shadow(0 0 6px rgba(168, 85, 247, 0.4))",
          } as React.CSSProperties
        }
      />

      {/* Vòng thứ 3 - Vàng */}
      <div
        className="absolute inset-4 border-[2.5px] border-amber-400/90 rounded-full orbital-complex"
        style={
          {
            "--rotate-x": "85deg",
            "--rotate-y": "45deg",
            animationDuration: "4s", // increased from 1s to 3s
            animationDirection: "reverse",
            transformStyle: "preserve-3d",
            filter: "drop-shadow(0 0 6px rgba(251, 191, 36, 0.4))",
          } as React.CSSProperties
        }
      />

      {/* Vòng thứ 4 - Hồng */}
      <div
        className="absolute inset-6 border-[2px] border-rose-400/90 rounded-full orbital-multi"
        style={
          {
            "--rotate-x": "30deg",
            "--rotate-y": "-80deg",
            animationDuration: "3.5s", // increased from 0.8s to 2.5s
            animationDirection: "reverse",
            transformStyle: "preserve-3d",
            filter: "drop-shadow(0 0 4px rgba(251, 113, 133, 0.4))",
          } as React.CSSProperties
        }
      />

      {/* Vòng trong cùng - Xanh lá */}
      <div
        className="absolute inset-8 border-[2px] border-emerald-400/90 rounded-full orbital-complex"
        style={
          {
            "--rotate-x": "90deg",
            "--rotate-y": "10deg",
            animationDuration: "3s", // increased from 0.6s to 2s
            transformStyle: "preserve-3d",
            filter: "drop-shadow(0 0 4px rgba(52, 211, 153, 0.4))",
          } as React.CSSProperties
        }
      />

      {/* Tâm phát sáng */}
      <div
        className="w-4 h-4 bg-gradient-to-r from-white to-blue-100 rounded-full shadow-lg animate-pulse"
        style={{
          filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))",
          animationDuration: "1.5s", // increased from 0.5s to 1.5s
          transform: "translateZ(10px)",
        }}
      />
    </div>
  );
}
