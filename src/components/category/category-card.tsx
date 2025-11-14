"use client";

import type React from "react";
import { useQueries } from "@tanstack/react-query";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Folder,
  Eye,
  Plus,
  FileText,
  FolderClosed,
  Loader2,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { Category, SubCategory } from "@/types";
import { categoryService } from "@/services/categoryService";
import { postService } from "@/services/postService";

export interface CategoryCardProps {
  category: Category;
  onView: (categoryId: string) => void;
  onEdit: (categoryId: string) => void;
  onDelete: (categoryId: string) => void;
  onAddSubCategory: (categoryId: string) => void;
  onViewSubCategory: (subCategory: SubCategory) => void;
}

export default function CategoryCard({
  category,
  onView,
  onEdit,
  onDelete,
  onAddSubCategory,
  onViewSubCategory,
}: CategoryCardProps) {
  const [showPopup, setShowPopup] = useState(false);

  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Use useQueries to fetch sub-categories and posts data
  const [
    {
      data: subCategoriesData,
      isLoading: subCategoriesLoading,
      error: subCategoriesError,
    },
    { data: postsData, isLoading: postsLoading, error: postsError },
  ] = useQueries({
    queries: [
      {
        queryKey: ["subCategories", category.id],
        queryFn: () => categoryService.getSubCategoryByCategoryId(category.id),
        enabled: !!category.id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
      },
      {
        queryKey: ["posts", category.id],
        queryFn: () => postService.getPostsByCategory(category.id),
        enabled: !!category.id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
      },
    ],
  });

  // Extract data from API responses
  const subCategories = subCategoriesData?.success
    ? subCategoriesData.data || []
    : [];
  const posts = postsData?.success ? postsData.data?.data || [] : [];
  const postCount = posts.length;

  // Loading and error states
  const isLoading = subCategoriesLoading || postsLoading;
  const hasError = subCategoriesError || postsError;

  const handleShowAction = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setShowPopup(true);
  };

  const handleActionClick = (action: () => void) => {
    action();
    setShowPopup(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowPopup(false);
      }
    };

    if (showPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPopup]);

  return (
    <article className="group relative  rounded-xl border border-primary/50 bg-white transition-all duration-300 hover:-translate-y-1">
      {/* Header */}
      <header className="p-6 pb-4 ">
        <div className="flex items-start justify-between pb-6 border-b border-secondary/50">
          <div
            onClick={() => onView(category.id)}
            className="flex items-center gap-4 card-content cursor-pointer"
          >
            <div className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-semibold shadow-lg bg-primary">
              <FolderClosed className="h-7 w-7" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-primary hover:text-blue-600 transition-colors truncate">
                {category.key}
              </h3>
            </div>
            <span className="font-medium text-primary ml-2 pl-4 border-l border-primary">
              {postCount} posts
            </span>
          </div>

          <div className="relative">
            <button
              ref={buttonRef}
              onClick={(e) => handleShowAction(e)}
              className="rounded-lg p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Tùy chọn danh mục"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>

            {showPopup && (
              <div
                ref={popupRef}
                className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-xl z-50"
              >
                <div className="py-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActionClick(() => onView(category.id));
                    }}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Eye className="mr-3 h-4 w-4" />
                    View detail
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActionClick(() => onEdit(category.id));
                    }}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Edit className="mr-3 h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActionClick(() => onAddSubCategory(category.id));
                    }}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="mr-3 h-4 w-4" />
                    Add sub category
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActionClick(() => onDelete(category.id));
                    }}
                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="mr-3 h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="px-6 pb-6 card-content">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">Đang tải...</span>
          </div>
        ) : hasError ? (
          <div className="text-sm text-red-500 py-2">
            no data found, please try again later
          </div>
        ) : (
          <div>
            {/* Sub Categories */}
            {subCategories.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-6 mb-6">
                  <div className="flex items-center gap-2 text-primary font-medium">
                    <Folder className="h-6 w-6" />
                    <span>Sub categories:</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActionClick(() => onAddSubCategory(category.id));
                    }}
                    className="bg-primary text-white px-3 py-1.5 text-sm rounded-lg hover:bg-primary/90 transition-colors flex items-center"
                  >
                    <Plus className="h-4 w-4" />
                    Add sub category
                  </button>
                </div>
                <div className="flex flex-wrap  gap-4">
                  {subCategories.map((subCat) => (
                    <div
                      key={subCat.id}
                      onClick={() => onViewSubCategory(subCat)}
                      className="flex items-center gap-2 text-sm text-primary font-medium bg-thirdary cursor-pointer hover:bg-primary hover:text-white transition-colors rounded-full px-5 py-2"
                    >
                      <span className="truncate">{subCat.key}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state for sub-categories */}
            {subCategories.length === 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Folder className="h-4 w-4" />
                <span>No sub categories</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-blue-200 transition-colors duration-300 pointer-events-none"></div>
    </article>
  );
}
