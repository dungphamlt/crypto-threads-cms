import { Post, PostDetail } from "@/types";
import { post, get, del, patch } from "./api";

export const postService = {
  createPost: (postData: Post) => {
    return post<PostDetail>("/content-management/articles", postData);
  },

  getPostList: (page: number = 1, pageSize: number = 10) => {
    return get<PostDetail[]>(
      `/content-management/articles?page=${page}&pageSize=${pageSize}`
    );
  },

  getPostsByCategory: (categoryId: string) => {
    return get<PostDetail[]>(
      `/content-management/articles?category=${categoryId}`
    );
  },

  getPostsBySubCategory: (subCategoryId: string) => {
    return get<PostDetail[]>(
      `/content-management/articles?sub-category=${subCategoryId}`
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
