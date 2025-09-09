import { del, get, patch, post } from "./api";
import { Category, SubCategory } from "@/types";

export const categoryService = {
  getCategoryList: () => {
    return get<Category[]>("/content-management/categories");
  },

  getSubCategoryList: (categoryId: string) => {
    return get<SubCategory[]>(
      `/content-management/sub-categories/category/${categoryId}`
    );
  },
  getCategoryDetail: (categoryId: string) => {
    return get<Category>(`/content-management/categories/${categoryId}`);
  },
  getSubCategoryDetail: (subCategoryId: string) => {
    return get<SubCategory>(
      `/content-management/sub-categories/${subCategoryId}`
    );
  },
  createCategory: (key: string) => {
    return post<Category>("/content-management/categories", { key });
  },
  createSubCategory: (key: string, categoryId: string) => {
    return post<SubCategory>("/content-management/sub-categories", {
      key,
      categoryId,
    });
  },
  updateCategory: (key: string, categoryId: string) => {
    return patch<Category>(`/content-management/categories/${categoryId}`, {
      key,
    });
  },
  updateSubCategory: (key: string, subCategoryId: string) => {
    return patch<SubCategory>(
      `/content-management/sub-categories/${subCategoryId}`,
      {
        key,
      }
    );
  },
  deleteCategory: (categoryId: string) => {
    return del<void>(`/content-management/categories/${categoryId}`);
  },
  deleteSubCategory: (subCategoryId: string) => {
    return del<void>(`/content-management/sub-categories/${subCategoryId}`);
  },
};
