"use client";

import PostTableLayout from "@/components/post/post-table-layout";
import PostGrid from "@/components/post/post-grid-layout";

interface SubcategoryPageProps {
  viewMode?: "table" | "grid";
}

export default function SubcategoryPage({
  viewMode = "grid",
}: SubcategoryPageProps) {
  return (
    <div className="min-h-[500px]">
      {viewMode === "table" ? <PostTableLayout /> : <PostGrid />}
    </div>
  );
}
