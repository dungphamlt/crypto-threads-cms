"use client";

import { useEffect, useState } from "react";
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
import { Empty, Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";

function CategoriesManagement() {
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
  const [subCategoryIdSelected, setSubCategoryIdSelected] = useState<
    string | null
  >(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubCategory, setEditingSubCategory] =
    useState<SubCategory | null>(null);

  // Data states
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Load categories
  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getCategoryList();
      if (response.success && response.data) {
        setCategories(response.data);
      } else {
        console.error("Failed to load categories:", response.error);
        setCategories([]);
        toast.error("Failed to load categories");
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
      setCategories([]);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

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

  const handleViewSubCategory = (subCategoryId: string) => {
    setSubCategoryIdSelected(subCategoryId);
    setIsViewSubCategoryDetailModalOpen(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    Modal.confirm({
      title: "Delete Category",
      icon: <ExclamationCircleOutlined />,
      content:
        "Are you sure you want to delete this category? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const response = await categoryService.deleteCategory(categoryId);
          if (response.success) {
            toast.success("Category deleted successfully");
            loadCategories();
          } else {
            toast.error("Failed to delete category");
          }
        } catch (error) {
          console.error("Error deleting category:", error);
          toast.error("Failed to delete category");
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
    loadCategories();
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
  };

  // Sub-category handlers
  const handleAddSubCategory = (categoryId: string) => {
    setCategoryIdSelected(categoryId);
    setEditingSubCategory(null);
    setIsSubCategoryModalOpen(true);
  };

  const handleEditSubCategory = (subCategoryId: string) => {
    setSubCategoryIdSelected(subCategoryId);
    setEditingSubCategory(null); // You might want to load this from API
    setIsSubCategoryModalOpen(true);
  };

  const handleDeleteSubCategory = (subCategoryId: string) => {
    Modal.confirm({
      title: "Delete Sub-Category",
      icon: <ExclamationCircleOutlined />,
      content:
        "Are you sure you want to delete this sub-category? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const response = await categoryService.deleteSubCategory(
            subCategoryId
          );
          if (response.success) {
            toast.success("Sub-category deleted successfully");
            loadCategories();
          } else {
            toast.error("Failed to delete sub-category");
          }
        } catch (error) {
          console.error("Error deleting sub-category:", error);
          toast.error("Failed to delete sub-category");
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
    loadCategories();
    setIsSubCategoryModalOpen(false);
    setEditingSubCategory(null);
    setCategoryIdSelected(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 ">
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <p className="text-gray-600">Loading categories...</p>
                </div>
              </div>
            ) : categories.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <Empty
                  description="No categories available"
                  className="py-16"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {/* View Sub Category Detail Modal */}
        <SubCategoryViewDetail
          subCategoryId={subCategoryIdSelected || ""}
          isOpen={isViewSubCategoryDetailModalOpen}
          onClose={() => {
            setIsViewSubCategoryDetailModalOpen(false);
            setSubCategoryIdSelected(null);
          }}
          onEdit={handleEditSubCategory}
          onDelete={handleDeleteSubCategory}
        />
      </div>
    </div>
  );
}

export default CategoriesManagement;
