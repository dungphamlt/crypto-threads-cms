import { get, post, patch } from "./api";

export enum AdminRole {
  ADMIN = "admin",
  WRITER = "writer",
}

export enum AuthorStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface Admin {
  _id: string;
  email: string;
  username: string;
  penName: string;
  socials: Record<string, string>;
  avatarUrl: string;
  description: string;
  designations: string[];
  role: AdminRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthorCreateDto {
  email: string;
  username: string;
  password: string;
  penName: string;
  socials: Record<string, string>;
  avatarUrl: string;
  description: string;
  designations: string[];
  role: AdminRole.WRITER;
}

export interface AuthorResponseDto {
  _id: string;
  email: string;
  username: string;
  password: string;
  penName: string;
  socials: Record<string, string>;
  avatarUrl: string;
  description: string;
  designations: string[];
  role: AdminRole;
  createdAt: string;
  updatedAt: string;
}

export const adminService = {
  getProfile: () => {
    return get<Admin>("/admin-aggregate/profile");
  },

  createAuthor: (author: AuthorCreateDto) => {
    return post<AuthorResponseDto>("/admin-aggregate/create-admin", author);
  },

  getAuthorList: () => {
    return get<AuthorResponseDto[]>("admin-aggregate/admins");
  },

  getAdminDetail: (id: number) => {
    return get<Admin>(`/admin-aggregate/admins/${id}`);
  },

  updateProfile: (author: Partial<Admin>) => {
    return patch<Admin>(`/admin-aggregate/profile`, author);
  },

  updateAuthor: (author: AuthorResponseDto) => {
    return patch<AuthorCreateDto>(
      `/admin-aggregate/admins/${author._id}`,
      author
    );
  },

  updatePassword: (passwordData: {
    oldPassword: string;
    newPassword: string;
  }) => {
    return post<void>("/admin-aggregate/change-password", passwordData);
  },

  getCmsLogs: async (page: number = 1, pageSize: number = 10) => {
    try {
      const response = await get(`/cms-log?page=${page}&pageSize=${pageSize}`);
      if (!response || !response.data) {
        throw new Error("Invalid response format");
      }
      return response.data;
    } catch (error) {
      console.error("Error fetching CMS logs:", error);
      throw error;
    }
  },
};
