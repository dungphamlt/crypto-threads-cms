import {
  ApiResponse,
  LoginAdminDto,
  RegisterUserDto,
  UpdatePasswordDto,
} from "@/types";
import { post, put, get } from "./api";
import { Admin } from "@/services/adminService";

interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    name: string;
    username?: string;
  };
}

interface VerifyEmailDto {
  email: string;
  otp: string;
}

export const authService = {
  login(loginDto: LoginAdminDto): Promise<ApiResponse<LoginResponse>> {
    return post<LoginResponse>("/auth/admin/login", loginDto);
  },
  getCurrentAdmin: () => {
    return get<Admin>("/auth/admin/me");
  },
  updatePassword: (passwordDto: UpdatePasswordDto) => {
    return put<void>("/auth/admin/password", passwordDto);
  },
  // register user
  register(registerDto: RegisterUserDto): Promise<ApiResponse<void>> {
    return post<void>("/auth/user/register", registerDto);
  },
  verifyEmail(verifyDto: VerifyEmailDto): Promise<ApiResponse<void>> {
    return post<void>("/auth/user/verify-email", verifyDto);
  },
  resendOtp(email: string): Promise<ApiResponse<void>> {
    return post<void>("/auth/user/resend-otp", { email });
  },
};
