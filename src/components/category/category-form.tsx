"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Modal } from "antd";
import { Folder, Save, Upload, X, Image as ImageIcon } from "lucide-react";
import { categoryService } from "@/services/categoryService";
import { Category } from "@/types";
import { postService } from "@/services/postService";
import toast from "react-hot-toast";

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (category: Category) => void;
  categoryId?: string;
  initialData?: Category;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  categoryId,
  initialData,
}) => {
  const [loading, setLoading] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const isEdit = !!categoryId && !!initialData;

  useEffect(() => {
    if (isOpen) {
      if (isEdit && initialData) {
        setCategoryName(initialData.key);
        setImageUrl(initialData.imageUrl);
      } else {
        setCategoryName("");
        setImageUrl(undefined);
      }
    }
  }, [isOpen, isEdit, initialData]);

  const handleFileUpload = useCallback(async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    setIsUploadingImage(true);
    const toastId = toast.loading("Uploading image...");

    try {
      const response = await postService.uploadImage(file, "categories");

      if (response.success && response.data) {
        const uploadedImageUrl = response.data.secureUrl || response.data.url;
        setImageUrl(uploadedImageUrl);
        toast.success("Image uploaded successfully", { id: toastId });
      } else {
        toast.error(response.error || "Failed to upload image", {
          id: toastId,
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image", { id: toastId });
    } finally {
      setIsUploadingImage(false);
    }
  }, []);

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  const handleRemoveImage = () => {
    setImageUrl(undefined);
  };

  const handleSubmit = async () => {
    if (!categoryName.trim()) return;

    setLoading(true);
    try {
      let response;

      if (isEdit) {
        // Update existing category
        response = await categoryService.updateCategory(
          categoryName,
          initialData!.id,
          imageUrl
        );
      } else {
        // Create new category
        response = await categoryService.createCategory(categoryName, imageUrl);
      }

      if (response.success && response.data) {
        const categoryData: Category = {
          id: response.data.id,
          key: response.data.key,
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt,
          imageUrl: response.data.imageUrl,
        };
        onSuccess(categoryData);
        onClose();
      }
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setCategoryName("");
    setImageUrl(undefined);
    onClose();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Folder className="text-blue-600 text-lg" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {isEdit ? "Edit Category" : "Create New Category"}
            </h3>
            <p className="text-sm text-gray-500">
              {isEdit
                ? "Update category information and manage sub-categories"
                : "Add a new category to your collection"}
            </p>
          </div>
        </div>
      }
      open={isOpen}
      onCancel={handleCancel}
      width={800}
      footer={null}
      className="category-form-modal"
    >
      <div className="space-y-6">
        {/* Name Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Category Name
          </label>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Enter category name (e.g., Technology, News, Sports)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Category Image
          </label>
          {imageUrl ? (
            <div className="relative">
              <div className="relative w-full h-48 rounded-lg border border-gray-300 overflow-hidden bg-gray-50">
                <img
                  src={imageUrl}
                  alt="Category preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <input
                type="file"
                id="category-image-upload"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={isUploadingImage}
              />
              <label
                htmlFor="category-image-upload"
                className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  isUploadingImage
                    ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                    : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                }`}
              >
                {isUploadingImage ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-gray-600">Uploading...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Upload className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className="text-sm text-gray-600">
                      Click to upload image
                    </span>
                    <span className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </span>
                  </div>
                )}
              </label>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!categoryName.trim() || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isEdit ? "Update Category" : "Create Category"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CategoryForm;
