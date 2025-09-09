"use client";

import { useState } from "react";
import { Plus, Grid3X3, List } from "lucide-react";
import {
  PostGridLayout,
  PostTableLayout,
  PostCreate,
  // PostViewDetail,
} from "@/components/post";
import type { PostDetail } from "@/services/postService";

type ViewMode = "grid" | "table";

function PostsManagement() {
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  // const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  // const [viewPostId, setViewPostId] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateSuccess = (post: PostDetail) => {
    // Refresh the posts list
    setRefreshKey((prev) => prev + 1);
    console.log("Post created successfully:", post);
  };

  // const handleEdit = (postId: string) => {
  //   setViewPostId(postId);
  //   setIsViewModalOpen(true);
  // };

  // const handleDelete = (postId: string) => {
  //   setViewPostId(postId);
  //   setIsViewModalOpen(true);
  // };

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

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm">
        {viewMode === "table" ? (
          <PostTableLayout key={`table-${refreshKey}`} />
        ) : (
          <div className="p-6">
            <PostGridLayout key={`grid-${refreshKey}`} />
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      <PostCreate
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSuccess={handleCreateSuccess}
      />
      {/* View Post Modal */}
      {/* <PostViewDetail
        postId={viewPostId}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        // onEdit={handleEdit}
        // onDelete={handleDelete}
      /> */}
    </div>
  );
}

export default PostsManagement;
