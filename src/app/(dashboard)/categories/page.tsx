"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import {
  CategoryCard,
  CategoryForm,
  SubCategoryForm,
  CategoryViewDetail,
  SubCategoryViewDetail,
} from "@/components/category";
import { Category, SubCategory } from "@/types";
import { categoryService } from "@/services/categoryService";
import { Empty } from "antd";
import toast from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

function CategoriesManagement() {
  const queryClient = useQueryClient();
  // Modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSubCategoryModalOpen, setIsSubCategoryModalOpen] = useState(false);
  const [isViewDetailModalOpen, setIsViewDetailModalOpen] = useState(false);
  const [
    isViewSubCategoryDetailModalOpen,
    setIsViewSubCategoryDetailModalOpen,
  ] = useState(false);

  // Selected items
  const [categoryIdSelected, setCategoryIdSelected] = useState<string | null>(
    null
  );
  const [selectedSubCategory, setSelectedSubCategory] =
    useState<SubCategory | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubCategory, setEditingSubCategory] =
    useState<SubCategory | null>(null);
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmText: string;
    cancelText: string;
    loading: boolean;
    onConfirm?: () => Promise<void>;
  }>({
    open: false,
    title: "",
    description: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    loading: false,
  });

  // Load categories
  const {
    data: categoriesResponse,
    isLoading: isLoadingCategories,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getCategoryList(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const categories = categoriesResponse?.success
    ? categoriesResponse.data || []
    : [];

  // Category handlers
  const handleCreateCategory = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (category) {
      setEditingCategory(category);
      setIsCategoryModalOpen(true);
    }
  };

  const handleViewCategory = (categoryId: string) => {
    setCategoryIdSelected(categoryId);
    setIsViewDetailModalOpen(true);
  };

  const handleViewSubCategory = (subCategory: SubCategory) => {
    setSelectedSubCategory(subCategory);
    setIsViewSubCategoryDetailModalOpen(true);
  };

  const closeConfirm = () => {
    setConfirmState((prev) => ({
      ...prev,
      open: false,
      loading: false,
      onConfirm: undefined,
    }));
  };

  const handleConfirm = async () => {
    if (!confirmState.onConfirm) {
      closeConfirm();
      return;
    }

    setConfirmState((prev) => ({ ...prev, loading: true }));
    try {
      await confirmState.onConfirm();
      closeConfirm();
    } catch (error) {
      console.error("Confirmation action failed:", error);
      setConfirmState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    setConfirmState({
      open: true,
      title: "Delete Category",
      description:
        "Are you sure you want to delete this category? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      loading: false,
      onConfirm: async () => {
        try {
          const response = await categoryService.deleteCategory(categoryId);
          if (!response.success) {
            throw new Error(response.error || "Failed to delete category");
          }
          toast.success("Category deleted successfully");
          refetchCategories();
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to delete category";
          toast.error(message);
          throw error;
        }
      },
    });
  };

  const handleCategorySuccess = (category: Category) => {
    console.log("Category updated successfully", category);
    toast.success(
      editingCategory
        ? "Category updated successfully"
        : "Category created successfully"
    );
    refetchCategories();
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
  };

  // Sub-category handlers
  const handleAddSubCategory = (categoryId: string) => {
    setCategoryIdSelected(categoryId);
    setEditingSubCategory(null);
    setIsSubCategoryModalOpen(true);
  };

  const handleEditSubCategory = (subCategory: SubCategory) => {
    setEditingSubCategory(subCategory);
    setCategoryIdSelected(subCategory.categoryId?.id || null);
    setIsSubCategoryModalOpen(true);
  };

  const handleDeleteSubCategory = (subCategoryId: string) => {
    setConfirmState({
      open: true,
      title: "Delete Sub-Category",
      description:
        "Are you sure you want to delete this sub-category? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      loading: false,
      onConfirm: async () => {
        try {
          const response = await categoryService.deleteSubCategory(
            subCategoryId
          );
          if (!response.success) {
            throw new Error(response.error || "Failed to delete sub-category");
          }
          toast.success("Sub-category deleted successfully");
          refetchCategories();
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to delete sub-category";
          toast.error(message);
          throw error;
        }
      },
    });
  };

  const handleSubCategorySuccess = (subCategory: SubCategory) => {
    console.log("Sub-category updated successfully", subCategory);
    toast.success(
      editingSubCategory
        ? "Sub-category updated successfully"
        : "Sub-category created successfully"
    );

    const parentCategoryId =
      categoryIdSelected ||
      subCategory.categoryId?.id ||
      selectedSubCategory?.categoryId?.id ||
      null;

    refetchCategories();

    if (parentCategoryId) {
      queryClient.invalidateQueries({
        queryKey: ["subCategories", parentCategoryId],
      });
      queryClient.invalidateQueries({
        queryKey: ["posts", parentCategoryId],
      });
    }

    setIsSubCategoryModalOpen(false);
    setEditingSubCategory(null);
    setCategoryIdSelected(null);
    setSelectedSubCategory(null);
  };

  return (
    <>
      {confirmState.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-900">
                {confirmState.title}
              </h2>
              <p className="text-sm text-gray-600">
                {confirmState.description}
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeConfirm}
                disabled={confirmState.loading}
                className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg border border-gray-200 hover:text-gray-800 hover:border-gray-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {confirmState.cancelText}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={confirmState.loading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg shadow-sm hover:bg-red-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {confirmState.loading && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {confirmState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900">
              Categories Management
            </h1>
            <p className="text-gray-600">
              Organize and manage your content categories
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCreateCategory}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Plus className="h-4 w-4" />
              Create Category
            </button>
          </div>
        </div>

        {/* Main Content */}

        <div className="">
          {isLoadingCategories ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-gray-600">Loading categories...</p>
              </div>
            </div>
          ) : categories.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <Empty description="No categories available" className="py-16" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onView={handleViewCategory}
                  onEdit={handleEditCategory}
                  onDelete={handleDeleteCategory}
                  onAddSubCategory={handleAddSubCategory}
                  onViewSubCategory={handleViewSubCategory}
                />
              ))}
            </div>
          )}
        </div>

        {/* Create and Edit Category Modal */}
        <CategoryForm
          isOpen={isCategoryModalOpen}
          onClose={() => {
            setIsCategoryModalOpen(false);
            setEditingCategory(null);
          }}
          onSuccess={handleCategorySuccess}
          categoryId={editingCategory?.id}
          initialData={editingCategory || undefined}
        />

        {/* Create and Edit Sub Category Modal */}
        <SubCategoryForm
          isOpen={isSubCategoryModalOpen}
          onClose={() => {
            setIsSubCategoryModalOpen(false);
            setEditingSubCategory(null);
            setCategoryIdSelected(null);
          }}
          onSuccess={handleSubCategorySuccess}
          parentCategoryId={categoryIdSelected || ""}
          subCategoryId={editingSubCategory?.id}
          initialData={editingSubCategory || undefined}
        />

        {/* View Category Detail Modal */}
        {categoryIdSelected && isViewDetailModalOpen && (
          <CategoryViewDetail
            categoryId={categoryIdSelected || ""}
            isOpen={isViewDetailModalOpen}
            onClose={() => {
              setIsViewDetailModalOpen(false);
              setCategoryIdSelected(null);
            }}
            onEdit={handleEditCategory}
            onDelete={handleDeleteCategory}
            onAddSubCategory={handleAddSubCategory}
          />
        )}

        {/* View Sub Category Detail Modal */}
        {selectedSubCategory && isViewSubCategoryDetailModalOpen && (
          <SubCategoryViewDetail
            subCategory={selectedSubCategory}
            isOpen={isViewSubCategoryDetailModalOpen}
            onClose={() => {
              setIsViewSubCategoryDetailModalOpen(false);
              setSelectedSubCategory(null);
            }}
            onEdit={handleEditSubCategory}
            onDelete={handleDeleteSubCategory}
          />
        )}
      </div>
    </>
  );
}

export default CategoriesManagement;
