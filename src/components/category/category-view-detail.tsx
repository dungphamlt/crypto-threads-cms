"use client";

import React from "react";
import { Modal } from "antd";
import {
  Edit,
  Trash2,
  Calendar,
  Folder,
  FileText,
  Plus,
  Loader2,
} from "lucide-react";
import { categoryService } from "@/services/categoryService";
import { postService } from "@/services/postService";
import Link from "next/link";
import { useQueries } from "@tanstack/react-query";

interface CategoryViewDetailProps {
  categoryId: string;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (categoryId: string) => void;
  onDelete?: (categoryId: string) => void;
  onAddSubCategory?: (categoryId: string) => void;
}

const CategoryViewDetail: React.FC<CategoryViewDetailProps> = ({
  categoryId,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onAddSubCategory,
}) => {
  // Load categories, subcategories, posts dùng useQueries
  const [
    { data: categoryResponse, isLoading: categoryLoading },
    { data: subCategoriesResponse, isLoading: subCategoriesLoading },
    { data: postsResponse, isLoading: postsLoading },
  ] = useQueries({
    queries: [
      {
        queryKey: ["category", categoryId],
        queryFn: () => categoryService.getCategoryDetail(categoryId),
        enabled: !!categoryId && isOpen,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
      },
      {
        queryKey: ["subCategories", categoryId],
        queryFn: () => categoryService.getSubCategoryByCategoryId(categoryId),
        enabled: !!categoryId && isOpen,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
      },
      {
        queryKey: ["posts", categoryId],
        queryFn: () => postService.getPostsByCategory(categoryId),
        enabled: !!categoryId && isOpen,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
      },
    ],
  });

  const category = categoryResponse?.success ? categoryResponse.data : null;
  const subCategories = subCategoriesResponse?.success
    ? subCategoriesResponse.data
    : [];
  const posts = postsResponse?.success ? postsResponse.data?.data : [];

  const loading = categoryLoading || subCategoriesLoading || postsLoading;

  const handleEdit = () => {
    if (onEdit) {
      onEdit(categoryId);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(categoryId);
    }
  };

  const handleAddSubCategoryClick = () => {
    if (onAddSubCategory) {
      onAddSubCategory(categoryId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) return null;

  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold"
            style={{ backgroundColor: "#6366f1" }}
          >
            📁
          </div>
          <span className="text-lg font-semibold">Category Details</span>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      width={1000}
      footer={null}
      className="category-view-modal"
    >
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : category ? (
        <div className="space-y-6">
          {/* Header Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white font-semibold text-3xl mx-auto mb-4"
                  style={{ backgroundColor: "#6366f1" }}
                >
                  📁
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {category.key}
                </h2>
              </div>
              <div className="md:col-span-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-500">
                      ID
                    </label>
                    <div className="mt-1">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {category.id}
                      </code>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-500">
                      Created
                    </label>
                    <div className="mt-1 flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(category.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-500">
                      Last Updated
                    </label>
                    <div className="mt-1 flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(category.updatedAt)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sub Categories */}
          <div className="bg-white rounded-lg border border-gray-200 mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <Folder className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Sub Categories ({subCategories?.length || 0})
                </h3>
              </div>
            </div>
            <div className="p-6">
              {subCategoriesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : subCategories?.length === 0 ? (
                <div className="text-center py-8">
                  <Folder className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No sub-categories found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {subCategories?.map((subCategory) => (
                    <div
                      key={subCategory.id}
                      className="flex items-center p-4 bg-gray-50 rounded-lg border"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                        <Folder className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <span className="font-medium text-gray-900 mr-2">
                            {subCategory.key}
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            ID: {subCategory.id}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Created: {formatDate(subCategory.createdAt)}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Updated: {formatDate(subCategory.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Posts */}
          <div className="bg-white rounded-lg border border-gray-200 mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-4">
                  <FileText className="h-5 w-5 text-purple-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Posts ({Array.isArray(posts) ? posts.length : 0})
                  </h3>
                </div>
                <Link
                  href={{
                    pathname: "/posts/all-posts",
                    query: { category: category.id },
                  }}
                  className="text-blue-600 hover:underline text-lg"
                >
                  View All
                </Link>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            {onAddSubCategory && (
              <button
                onClick={handleAddSubCategoryClick}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Sub-Category
              </button>
            )}
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Category
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Category
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <Folder className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Category not found</p>
        </div>
      )}
    </Modal>
  );
};

export default CategoryViewDetail;
