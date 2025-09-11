export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  status?: number;
}

export interface LoginAdminDto {
  username: string;
  password: string;
}

export interface RegisterUserDto {
  email: string;
  password: string;
  username: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
}

export interface UpdatePasswordDto {
  oldPassword: string;
  newPassword: string;
}

export interface Creator {
  _id: string;
  email: string;
  id: string;
}

export interface Post {
  title: string;
  content: string;
  category: string;
  subCategory?: string;
  tags: string[];
  metaDescription: string;
  excerpt: string;
  coverUrl?: string;
  status: POST_STATUS;
  slug?: string; // Thêm slug cho Post creation
  publishTime: string; // Thêm publishTime cho Post creation
}

export interface PostDetail {
  _id: string;
  id: string; // API trả về cả _id và id
  category: {
    id: string;
    key: string;
  };
  subCategory?: {
    id: string;
    key: string;
  };
  title: string;
  content: string;
  metaDescription: string;
  excerpt: string;
  creator: Creator;
  views: number;
  tags: string[];
  coverUrl?: string;
  status: POST_STATUS;
  slug: string;
  createdAt: string;
  updatedAt: string;
  publishTime: string;
}

export enum POST_STATUS {
  DRAFT = "draft",
  PUBLISHED = "published",
  TRASH = "trash",
  SCHEDULE = "schedule",
}

export const POST_STATUS_OPTION: Record<POST_STATUS, string> = {
  draft: "draft",
  published: "published",
  trash: "trash",
  schedule: "schedule",
};

export interface Category {
  id: string;
  key: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubCategory {
  id: string;
  key: string;
  categoryId: {
    id: string;
    key: string;
  };
  createdAt: string;
  updatedAt: string;
}
