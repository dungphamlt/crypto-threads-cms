"use client";

import { useState } from "react";
import { Plus, Grid3X3, List } from "lucide-react";
import PostGrid from "@/components/post/post-grid-layout";
import PostTableLayout from "@/components/post/post-table-layout";
import PostFormModal from "@/components/post/post-create";
import type { PostDetail } from "@/services/postService";

type ViewMode = "grid" | "table";

function PostsManagement() {
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateSuccess = (post: PostDetail) => {
    // Refresh the posts list
    setRefreshKey((prev) => prev + 1);
    console.log("Post created successfully:", post);
  };

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Posts Management</h1>

        <div className="flex items-center gap-3">
          {/* Add New Post Button */}
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Create Post
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

      {/* Stats Bar (Optional) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">-</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <List className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-bold text-green-600">-</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <div className="h-6 w-6 bg-green-600 rounded-full flex items-center justify-center">
                <div className="h-2 w-2 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Drafts</p>
              <p className="text-2xl font-bold text-orange-600">-</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <div className="h-6 w-6 bg-orange-600 rounded-full flex items-center justify-center">
                <div className="h-2 w-2 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm">
        {viewMode === "table" ? (
          <PostTableLayout key={`table-${refreshKey}`} />
        ) : (
          <div className="p-6">
            <PostGrid key={`grid-${refreshKey}`} />
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      <PostFormModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}

export default PostsManagement;
