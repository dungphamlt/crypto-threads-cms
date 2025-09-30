"use client";

import { useState } from "react";
import { Trash2, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { postService } from "@/services/postService";
import { POST_STATUS } from "@/types";

interface DeletePostButtonProps {
  postId: string;
  className?: string;
  title?: string;
  onSuccess?: () => void;
  disabled?: boolean;
}

function DeletePostButton({
  postId,
  className = "",
  title = "",
  onSuccess,
  disabled = false,
}: DeletePostButtonProps) {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !loading) {
      setIsModalOpen(true);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    const toastId = toast.loading("Moving post to trash...");

    try {
      const response = await postService.updatePostStatus(
        postId,
        POST_STATUS.TRASH
      );

      if (response.success) {
        toast.success("Post moved to trash successfully", { id: toastId });
        setIsModalOpen(false);
        onSuccess?.();
      } else {
        const errorMessage = response.error || "Failed to delete post";
        toast.error(errorMessage, { id: toastId });
      }
    } catch (error) {
      console.error("Delete error:", error);
      const errorMessage = "Failed to delete post";
      toast.error(errorMessage, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={showModal}
        disabled={disabled || loading}
        className={`p-2 text-red-500 flex text-sm items-center gap-2 hover:bg-red-50 rounded-md transition-colors ${
          disabled || loading ? "opacity-50 cursor-not-allowed" : ""
        } ${className}`}
        title="Move to Trash"
      >
        <Trash2 className="h-4 w-4" />
        {title && title}
      </button>

      {/* Custom Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleCancel}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Post
              </h3>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <p className="text-gray-600 mb-6">
              Are you sure you want to move this post to trash? This action can
              be undone.
            </p>

            {/* Footer */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancel}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Move to Trash"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DeletePostButton;
