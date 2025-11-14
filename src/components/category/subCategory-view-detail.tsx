"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "antd";
import {
  Edit,
  Trash2,
  Calendar,
  Folder,
  FileText,
  Eye,
  User,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { postService } from "@/services/postService";
import { SubCategory, PostDetail } from "@/types";
import Link from "next/link";

interface SubCategoryViewDetailProps {
  subCategory: SubCategory;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (subCategory: SubCategory) => void;
  onDelete?: (subCategoryId: string) => void;
  onBackToCategory?: (categoryId: string) => void;
}

const SubCategoryViewDetail: React.FC<SubCategoryViewDetailProps> = ({
  subCategory,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onBackToCategory,
}) => {
  const [posts, setPosts] = useState<PostDetail[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);

  const handleEdit = () => {
    if (onEdit && subCategory) {
      onEdit(subCategory);
    }
  };

  const handleDelete = () => {
    if (onDelete && subCategory?.id) {
      onDelete(subCategory.id);
    }
  };

  const handleBackToCategory = () => {
    const categoryId = subCategory?.categoryId?.id;
    if (onBackToCategory && categoryId) {
      onBackToCategory(categoryId);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setPostsLoading(false);
      return;
    }

    const fetchPosts = async () => {
      try {
        const response = await postService.getPostsBySubCategory(
          subCategory.id
        );
        if (response.success && response.data) {
          setPosts(response.data.data);
        } else {
          setPosts([]);
        }
      } catch (error) {
        console.error("Failed to fetch posts:", error);
        setPosts([]);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchPosts();
  }, [isOpen, subCategory]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  if (!isOpen) return null;

  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold"
            style={{ backgroundColor: "#8b5cf6" }}
          >
            📁
          </div>
          <span className="text-lg font-semibold">Sub-Category Details</span>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      width={1000}
      footer={null}
      className="subcategory-view-modal"
      zIndex={20}
    >
      {subCategory ? (
        <div className="space-y-6">
          {/* Header Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-semibold text-3xl mx-auto mb-4"
                  style={{ backgroundColor: "#8b5cf6" }}
                >
                  📁
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {subCategory.key}
                </h2>
              </div>
              <div className="md:col-span-2">
                <div className="space-y-3">
                  {subCategory.categoryId && (
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-500">
                        Category
                      </label>
                      <div className="mt-1">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                          {subCategory.categoryId.key}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-500">
                      Created
                    </label>
                    <div className="mt-1 flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(subCategory.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-500">
                      Last Updated
                    </label>
                    <div className="mt-1 flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(subCategory.updatedAt)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Posts */}
          <div className="bg-white rounded-lg border border-gray-200 mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Posts ({posts.length})
                  </h3>
                </div>
                {posts.length > 0 && subCategory?.id && (
                  <Link
                    href={`/posts?subCategory=${subCategory.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200 hover:underline"
                  >
                    View All
                  </Link>
                )}
              </div>
            </div>
            <div className="p-6">
              {postsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No posts found in this sub-category
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.slice(0, 5).map((post) => (
                    <div
                      key={post.id}
                      className="flex items-start p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                        <FileText className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-1">
                              {post.title}
                            </h4>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <div className="flex items-center text-sm text-gray-500">
                              <Eye className="h-4 w-4 mr-1" />
                              {post.views}
                            </div>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                post.status === "published"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-orange-100 text-orange-800"
                              }`}
                            >
                              {post.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <span className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {post.creator.email}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(post.createdAt)}
                          </span>
                          {post.tags.length > 0 && (
                            <div className="flex items-center space-x-1">
                              {post.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                              {post.tags.length > 3 && (
                                <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                                  +{post.tags.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {posts.length > 5 && (
                    <div className="text-center pt-4">
                      <Link
                        href={`/posts?subCategory=${subCategory.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200 hover:underline"
                      >
                        View {posts.length - 5} more posts →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div className="flex items-center gap-3">
              {subCategory.categoryId && onBackToCategory && (
                <button
                  onClick={handleBackToCategory}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to {subCategory.categoryId.key}
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Sub-Category
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Sub-Category
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <Folder className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Sub-category not found</p>
        </div>
      )}
    </Modal>
  );
};

export default SubCategoryViewDetail;
