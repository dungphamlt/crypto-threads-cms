export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  VERIFY_EMAIL: "/auth/verify-email",

  // Posts
  POSTS: "/content-management/articles",
  POST_DETAIL: (id: string) => `/content-management/articles/${id}`,
  POST_STATUS: (id: string) => `/content-management/articles/${id}/status`,

  // Categories
  CATEGORIES: "/content-management/categories",
  CATEGORY_DETAIL: (category: string) =>
    `/content-management/categories/${category}`,
  SUBCATEGORY_DETAIL: (category: string, subcategory: string) =>
    `/content-management/categories/${category}/${subcategory}`,

  // Admin
  ADMIN_USERS: "/admin/users",
  ADMIN_STATS: "/admin/stats",
} as const;

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";


