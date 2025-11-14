"use client";

import React, { useState, useEffect } from "react";
import { Save, X } from "lucide-react";
import { postService } from "@/services/postService";
import { PostDetail, POST_STATUS, Post } from "@/types";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { categoryService } from "@/services/categoryService";

interface PostQuickEditProps {
  post: PostDetail;
  onSuccess: (post: PostDetail) => void;
  onCancel: () => void;
}

const PostQuickEdit: React.FC<PostQuickEditProps> = ({
  post,
  onSuccess,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [metaDescription, setMetaDescription] = useState(
    post.metaDescription || ""
  );
  const [slug, setSlug] = useState(post.slug || "");
  const [status, setStatus] = useState<POST_STATUS>(post.status);
  const [tags, setTags] = useState<string[]>(
    Array.isArray(post.tags) ? post.tags : []
  );
  const [tagInput, setTagInput] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>(
    typeof post.category === "object" ? post.category.id : post.category || ""
  );
  const [subCategoryId, setSubCategoryId] = useState<string>(
    post.subCategory && typeof post.subCategory === "object"
      ? post.subCategory.id
      : post.subCategory || ""
  );

  const { data: categoriesResponse } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getCategoryList(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: subCategoriesResponse } = useQuery({
    queryKey: ["subCategories"],
    queryFn: () => categoryService.getSubCategoryList(),
    staleTime: 5 * 60 * 1000,
  });

  const categories = categoriesResponse?.success
    ? categoriesResponse.data || []
    : [];
  const subCategories = subCategoriesResponse?.success
    ? subCategoriesResponse.data || []
    : [];

  const filteredSubCategories = subCategories.filter(
    (subCat) => subCat.categoryId?.id === categoryId
  );

  useEffect(() => {
    setTitle(post.title);
    setMetaDescription(post.metaDescription || "");
    setSlug(post.slug || "");
    setStatus(post.status);
    setTags(Array.isArray(post.tags) ? post.tags : []);
    setTagInput("");
    setCategoryId(
      typeof post.category === "object" ? post.category.id : post.category || ""
    );
    setSubCategoryId(
      post.subCategory && typeof post.subCategory === "object"
        ? post.subCategory.id
        : post.subCategory || ""
    );
  }, [post]);

  const addTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 10) {
      setTags((prev) => [...prev, trimmedTag]);
      setTagInput("");
    }
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const updateData: Partial<Post> = {
        title: title.trim(),
        metaDescription: metaDescription.trim(),
        slug: slug.trim(),
        status,
        tags,
        category: categoryId,
        subCategory: subCategoryId,
      };

      const response = await postService.updatePost(post.id, updateData);

      if (response.success && response.data) {
        toast.success("Post updated successfully");
        onSuccess(response.data);
      } else {
        toast.error("Failed to update post");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("Failed to update post");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setTitle(post.title);
    setMetaDescription(post.metaDescription || "");
    setSlug(post.slug || "");
    setStatus(post.status);
    setTags(Array.isArray(post.tags) ? post.tags : []);
    setTagInput("");
    setCategoryId(
      typeof post.category === "object" ? post.category.id : post.category || ""
    );
    setSubCategoryId(
      post.subCategory && typeof post.subCategory === "object"
        ? post.subCategory.id
        : post.subCategory || ""
    );
    onCancel();
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
        QUICK EDIT
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-4 gap-y-6 items-stretch">
          {/* Column 1: Title (inline) + Slug (inline) */}
          <div className="flex flex-col gap-3 h-full">
            {/* Title inline */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap w-28">
                Title:
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                placeholder="Enter post title"
              />
            </div>

            {/* Slug inline */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap w-28">
                Slug:
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                placeholder="Enter post slug"
              />
            </div>
          </div>

          {/* Column 2: Category & SubCategory (inline selects, selects half width) */}
          <div className="flex flex-col gap-3 h-full">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap w-28">
                Category:
              </label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setSubCategoryId("");
                }}
                className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">Select</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.key}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap w-28">
                SubCategory:
              </label>
              <select
                value={subCategoryId}
                onChange={(e) => setSubCategoryId(e.target.value)}
                disabled={!categoryId}
                className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select</option>
                {filteredSubCategories.map((subCat) => (
                  <option key={subCat.id} value={subCat.id}>
                    {subCat.key}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Column 3: Tags (inline label + input/button) + Status (inline) */}
          <div className="flex flex-col gap-3 h-full">
            <div className="flex items-start gap-3">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap w-28">
                Tags:
              </label>
              <div className="flex-1">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    placeholder="Add tags (Enter or comma)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    disabled={tags.length >= 10}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    disabled={!tagInput.trim() || tags.length >= 10}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>

                {/* tags list with max height */}
                <div className="mt-2">
                  {tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2 max-h-28 overflow-auto p-1">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-red-500 ml-1"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">No tags added yet</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap w-28">
                Status:
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as POST_STATUS)}
                className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value={POST_STATUS.DRAFT}>Draft</option>
                <option value={POST_STATUS.PUBLISHED}>Published</option>
                <option value={POST_STATUS.SCHEDULE}>Scheduled</option>
                <option value={POST_STATUS.TRASH}>Trash</option>
              </select>
            </div>
          </div>
        </div>

        {/* Meta description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Meta Description
          </label>
          <textarea
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            placeholder="Enter meta description"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Update
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostQuickEdit;
