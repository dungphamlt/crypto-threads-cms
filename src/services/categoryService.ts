import { del, get, patch, post } from "./api";
import { Category, SubCategory } from "@/types";

export const categoryService = {
  getCategoryList: () => {
    return get<Category[]>("/content-management/categories");
  },

  getSubCategoryList: () => {
    return get<SubCategory[]>("/content-management/sub-categories");
  },

  getSubCategoryByCategoryId: (categoryId: string) => {
    return get<SubCategory[]>(
      `/content-management/sub-categories/category/${categoryId}`
    );
  },
  getCategoryDetail: (categoryId: string) => {
    return get<Category>(`/content-management/categories/${categoryId}`);
  },
  getSubCategoryDetail: (subCategoryId: string) => {
    return get<SubCategory>(
      `/content-management/sub-categories/id/${subCategoryId}`
    );
  },
  createCategory: (key: string, imageUrl?: string) => {
    return post<Category>("/content-management/categories", { key, imageUrl });
  },
  createSubCategory: (key: string, categoryId: string, imageUrl?: string) => {
    return post<SubCategory>("/content-management/sub-categories", {
      key,
      categoryId,
      imageUrl,
    });
  },
  updateCategory: (key: string, categoryId: string, imageUrl?: string) => {
    return patch<Category>(`/content-management/categories/${categoryId}`, {
      key,
      imageUrl,
    });
  },
  updateSubCategory: (
    key: string,
    subCategoryId: string,
    imageUrl?: string
  ) => {
    return patch<SubCategory>(
      `/content-management/sub-categories/${subCategoryId}`,
      {
        key,
        imageUrl,
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
