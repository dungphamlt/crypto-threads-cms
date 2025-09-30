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
  password: string;
  penName: string;
  socials: Record<string, string>;
  avatarUrl: string;
  description: string;
  designations: string[];
  role: AdminRole;
}

export interface Author {
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

export const adminService = {
  getProfile: () => {
    return get<Admin>("/admin-aggregate/profile");
  },

  createAuthor: (author: Author) => {
    return post<Author>("/admin-aggregate/create-admin", author);
  },

  getAuthorList: () => {
    return get<Author[]>("admin-aggregate/admins");
  },

  getAdminDetail: (id: number) => {
    return get<Admin>(`/admin-aggregate/admins/${id}`);
  },

  updateAuthor: (author: Author) => {
    return patch<Author>(`/admin-aggregate/profile`, author);
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
