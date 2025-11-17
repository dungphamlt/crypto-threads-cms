"use client";

import { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

interface DeleteTagModalProps {
  tagName?: string;
  count?: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DeleteTagModal: React.FC<DeleteTagModalProps> = ({
  tagName,
  count,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  // Determine if it's bulk delete or single delete
  const isBulkDelete = count !== undefined && count > 0;

  const handleDelete = async () => {
    try {
      setLoading(true);
      await onSuccess();
      onClose();
    } catch (error) {
      console.error("Error deleting tag(s):", error);
      toast.error("Failed to delete tag(s)");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {isBulkDelete ? "Delete Tags" : "Delete Tag"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <p className="text-gray-600 mb-6">
          {isBulkDelete
            ? `Are you sure you want to delete ${count} tag(s)? This action cannot be undone.`
            : `Are you sure you want to delete the tag "${tagName}"? This action cannot be undone.`}
        </p>

        {/* Footer */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
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
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteTagModal;
