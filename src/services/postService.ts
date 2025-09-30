import { Post, PostDetail } from "@/types";
import { post, get, del, patch } from "./api";

export interface PostListParams {
  page: number;
  pageSize: number;
  startDate?: string;
  endDate?: string;
  category?: string;
  subCategory?: string;
  search?: string;
  creator?: string;
  status?: string;
  slug?: string;
}

export interface PostListResponse {
  data: PostDetail[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export const postService = {
  createPost: (postData: Post) => {
    return post<PostDetail>("/content-management/articles", postData);
  },

  getPostList: (params: PostListParams) => {
    // Build URL params with only non-empty values
    const urlParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        urlParams.append(key, String(value));
      }
    });

    return get<PostListResponse>(
      `/content-management/articles?${urlParams.toString()}`
    );
  },

  getPostsByCategory: (categoryId: string) => {
    return get<PostListResponse>(
      `/content-management/articles?category=${categoryId}`
    );
  },

  getPostsBySubCategory: (subCategoryId: string) => {
    return get<PostListResponse>(
      `/content-management/articles?subCategory=${subCategoryId}`
    );
  },

  getPostDetail: (id: string) => {
    return get<PostDetail>(`/content-management/articles/${id}`);
  },

  updatePost: (id: string, postData: Partial<Post>) => {
    return patch<PostDetail>(`/content-management/articles/${id}`, postData);
  },

  updatePostStatus: (id: string, status: string) => {
    return patch<PostDetail>(`/content-management/articles/${id}/status`, {
      status,
    });
  },

  deletePost: (id: string) => {
    return del<void>(`/content-management/articles/${id}`);
  },

  // Helper method to get post by _id or id
  getPost: (idOrObjectId: string) => {
    return postService.getPostDetail(idOrObjectId);
  },
};

// Re-export types for convenience
export type { PostDetail, Post, Creator } from "@/types";
