"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "antd";
import { Folder, Save } from "lucide-react";
import { categoryService } from "@/services/categoryService";
import { Category } from "@/types";

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

  const isEdit = !!categoryId && !!initialData;

  useEffect(() => {
    if (isOpen) {
      if (isEdit && initialData) {
        setCategoryName(initialData.key);
      } else {
        setCategoryName("");
      }
    }
  }, [isOpen, isEdit, initialData]);

  const handleSubmit = async () => {
    if (!categoryName.trim()) return;

    setLoading(true);
    try {
      let response;

      if (isEdit) {
        // Update existing category
        response = await categoryService.updateCategory(
          categoryName,
          initialData!.id
        );
      } else {
        // Create new category
        response = await categoryService.createCategory(categoryName);
      }

      if (response.success && response.data) {
        const categoryData: Category = {
          id: response.data.id,
          key: response.data.key,
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt,
        };
        onSuccess(categoryData);
        onClose();
      }
    } catch (error) {
      console.error("Error saving category:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setCategoryName("");
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
