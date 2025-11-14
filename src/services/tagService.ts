import { del, get, patch, post } from "./api";
import { Tag, ApiResponse } from "@/types";

export interface TagListResponse {
  data: Tag[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export const tagService = {
  getTagList: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("pageSize", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const queryString = queryParams.toString();
    const endpoint = `/content-management/tags${queryString ? `?${queryString}` : ""}`;
    console.log("Fetching tags from:", endpoint);
    return get<TagListResponse>(endpoint);
  },

  getTagDetail: (tagId: string) => {
    return get<Tag>(`/content-management/tags/${tagId}`);
  },

  createTag: (data: { name: string; slug: string; description?: string }) => {
    return post<Tag>("/content-management/tags", data);
  },

  updateTag: (
    tagId: string,
    data: { name?: string; slug?: string; description?: string }
  ) => {
    return patch<Tag>(`/content-management/tags/${tagId}`, data);
  },

  deleteTag: (tagId: string) => {
    return del<void>(`/content-management/tags/${tagId}`);
  },

  deleteTags: (tagIds: string[]) => {
    return post<void>("/content-management/tags/bulk-delete", { tagIds });
  },
};

