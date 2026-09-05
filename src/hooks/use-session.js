import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, login as loginFn, logout as logoutFn } from "@/lib/auth.functions";
import { clearSession, saveSession } from "@/lib/exam-session";

export const SESSION_QUERY_KEY = ["session"];

// Reads the signed httpOnly session cookie (via the server) and tells the
// UI who is logged in, if anyone. Cache is short-lived since role/identity
// rarely changes mid-visit, but we still want nav links to update quickly
// right after login/logout.
export function useSession() {
  const query = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: () => getCurrentUser(),
    staleTime: 30_000,
  });

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
  };
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => loginFn({ data: input }),
    onSuccess: (result) => {
      if (result?.ok && result.user) {
        // Keep the lightweight client-side copy in sync too (used for
        // watermarking/violation logs on the exam pages).
        saveSession({ role: result.user.role, regNo: result.user.regNo });
        queryClient.setQueryData(SESSION_QUERY_KEY, result.user);
      }
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => logoutFn(),
    onSuccess: () => {
      clearSession();
      queryClient.setQueryData(SESSION_QUERY_KEY, null);
    },
  });
}
