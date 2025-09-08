import { ApiResponse, Post, PostDetail } from "@/types";
import { post, put, get, del, patch } from "./api";
import { API_ENDPOINTS } from "@/constants/api";

export const postService = {
  createPost: (postData: Post) => {
    return post<PostDetail>(API_ENDPOINTS.POSTS, postData);
  },

  getPostList: (page: number = 1, pageSize: number = 10) => {
    return get<PostDetail[]>(
      `${API_ENDPOINTS.POSTS}?page=${page}&pageSize=${pageSize}`
    );
  },

  getPostDetail: (id: string) => {
    return get<PostDetail>(API_ENDPOINTS.POST_DETAIL(id));
  },

  updatePost: (id: string, postData: Partial<Post>) => {
    return patch<PostDetail>(API_ENDPOINTS.POST_DETAIL(id), postData);
  },

  updatePostStatus: (id: string, status: string) => {
    return patch<PostDetail>(API_ENDPOINTS.POST_STATUS(id), {
      status,
    });
  },

  deletePost: (id: string) => {
    return del<void>(API_ENDPOINTS.POST_DETAIL(id));
  },

  // Helper method to get post by _id or id
  getPost: (idOrObjectId: string) => {
    return postService.getPostDetail(idOrObjectId);
  },
};

// Re-export types for convenience
export type { PostDetail, Post, Creator } from "@/types";
