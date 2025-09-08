import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const login = useMutation({
    mutationFn: authService.login,
    onSuccess: (response) => {
      if (response.success && response.data?.token) {
        Cookies.set("token", response.data.token);
        queryClient.invalidateQueries({ queryKey: ["user"] });
        router.push("/dashboard");
      }
    },
  });

  const logout = () => {
    Cookies.remove("token");
    queryClient.clear();
    router.push("/login");
  };

  const isAuthenticated = () => {
    return !!Cookies.get("token");
  };

  return {
    login,
    logout,
    isAuthenticated,
  };
};


