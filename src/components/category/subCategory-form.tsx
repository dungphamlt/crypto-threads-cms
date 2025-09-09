"use client";

import React, { useState, useEffect } from "react";
import { Modal, message } from "antd";
import { Folder, Save } from "lucide-react";
import { categoryService } from "@/services/categoryService";
import { SubCategory } from "@/types";

interface SubCategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (subCategory: SubCategory) => void;
  parentCategoryId: string;
  subCategoryId?: string;
  initialData?: SubCategory;
}

const SubCategoryForm: React.FC<SubCategoryFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  parentCategoryId,
  subCategoryId,
  initialData,
}) => {
  const [loading, setLoading] = useState(false);
  const [subCategoryName, setSubCategoryName] = useState("");
  const [errors, setErrors] = useState<{ name?: string }>({});

  const isEdit = !!subCategoryId && !!initialData;
  const [parentCategoryName, setParentCategoryName] = useState("");

  useEffect(() => {
    const fetchParentCategoryName = async () => {
      if (parentCategoryId) {
        const response = await categoryService.getCategoryDetail(
          parentCategoryId
        );
        setParentCategoryName(response.data?.key || "");
      }
    };
    fetchParentCategoryName();
  }, [parentCategoryId]);

  useEffect(() => {
    if (isOpen) {
      if (isEdit && initialData) {
        setSubCategoryName(initialData.key);
      } else {
        setSubCategoryName("");
      }
      setErrors({});
    }
  }, [isOpen, isEdit, initialData]);

  const validateForm = () => {
    const newErrors: { name?: string } = {};

    if (!subCategoryName.trim()) {
      newErrors.name = "Sub-category name is required";
    } else if (subCategoryName.trim().length < 2) {
      newErrors.name = "Sub-category name must be at least 2 characters";
    } else if (subCategoryName.trim().length > 50) {
      newErrors.name = "Sub-category name must be less than 50 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let response;

      if (isEdit) {
        // Update existing sub-category
        response = await categoryService.updateSubCategory(
          subCategoryName,
          initialData!.id
        );
      } else {
        // Create new sub-category
        response = await categoryService.createSubCategory(
          subCategoryName,
          parentCategoryId
        );
      }

      if (response.success && response.data) {
        const subCategoryData: SubCategory = {
          id: response.data.id,
          key: response.data.key,
          categoryId:
            (response.data as SubCategory).categoryId || parentCategoryId,
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt,
        };
        onSuccess(subCategoryData);
        onClose();
      } else {
        message.error(response.error || "Failed to save sub-category");
      }
    } catch (error) {
      console.error("Error saving sub-category:", error);
      message.error("Failed to save sub-category");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSubCategoryName("");
    setErrors({});
    onClose();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubCategoryName(e.target.value);
    // Clear error when user starts typing
    if (errors.name) {
      setErrors({ ...errors, name: undefined });
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <Folder className="text-purple-600 text-lg" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {isEdit ? "Edit Sub-Category" : "Create New Sub-Category"}
            </h3>
            <p className="text-sm text-gray-500">
              {isEdit
                ? "Update sub-category information"
                : "Add a new sub-category to this category"}
            </p>
          </div>
        </div>
      }
      open={isOpen}
      onCancel={handleCancel}
      width={600}
      footer={null}
      className="subcategory-form-modal"
    >
      <div className="space-y-6">
        {/* Name Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Sub-Category Name
          </label>
          <input
            type="text"
            value={subCategoryName}
            onChange={handleNameChange}
            placeholder="Enter sub-category name"
            className={`w-full px-3 py-2 border rounded-lg ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        {/* Parent Category Info */}

        <div>
          <p className="text-base text-gray-700">
            Parent Category:{" "}
            <span className="font-medium text-lg text-gray-900">
              {parentCategoryName}
            </span>
          </p>
          <p className="text-xs text-gray-600">
            This sub-category will be added to the parent category
          </p>
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
            disabled={!subCategoryName.trim() || loading}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isEdit ? "Update Sub-Category" : "Create Sub-Category"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SubCategoryForm;
