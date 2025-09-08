"use client";

import type React from "react";
import { ArrowLeft, Home, Plus, Grid3X3, List } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function SubcategoryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { category: string; subcategory: string };
}) {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Subcategory Level Breadcrumb */}

      <div className="px-6 py-4">
        <div className="flex items-center gap-3">
          {/* Add New Post Button */}
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" />
            Thêm bài viết
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
              Grid
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === "table"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <List className="h-4 w-4" />
              Table
            </button>
          </div>
        </div>
      </div>

      <main>{children}</main>
    </div>
  );
}
