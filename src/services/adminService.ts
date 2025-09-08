import { get, post, put } from "./api";

export enum AdminRole {
  ADMIN = "admin",
  WRITER = "writer",
}

export enum AdminStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface Admin {
  _id: string;
  email: string;
  username: string;
  password: string;
  penName: string;
  socials: string[];
  avatarUrl: string;
  description: string;
  designations: string[];
  role: AdminRole;
  // status: AdminStatus,
}

export interface NewAdmin {
  email: string;
  username: string;
  password: string;
  penName: string;
  socials: string[];
  avatarUrl: string;
  description: string;
  designations: string[];
  role: AdminRole.WRITER;
}

export const adminService = {
  createAdmin: (admin: NewAdmin) => {
    return post<NewAdmin>("/admin-aggregate/create-admin", admin);
  },

  getAdminList: () => {
    return get<Admin[]>("/admin");
  },

  getAdminDetail: (id: number) => {
    return get<Admin>(`/admin-aggregate/admins/${id}`);
  },

  updateAdminRole: (id: number, adminRole: AdminRole) => {
    return put<Admin>(`/admin/${id}/role`, { id, adminRole });
  },
  updateAdminStatus: (id: number, status: AdminStatus) => {
    return put<Admin>(`/admin/${id}/status`, { id, status });
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
