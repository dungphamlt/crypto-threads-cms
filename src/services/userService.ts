// import { get, post, put } from "./api";

// export interface User {
//   id: string;
//   username: string;
//   email: string;
//   created_at: string;
//   updated_at: string;
// }

// export const userService = {
//     login: (username: string, password: string) => {
//     return post<{ access_token: string }>("/auth/login", { username, password });
//   },
//   register: (username: string, password: string, email: string) => {
//     return post<{ message: string }>("/auth/register", { username, password, email });
//   },
//   getUserProfile: (userId: string) => {
//     return get<User>(`/users/${userId}`);
//   },
//   updateUserProfile: (userId: string, userData: Partial<User>) => {
//     return put<User>(`/users/${userId}`, userData);
//   }
// };
