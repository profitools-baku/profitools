import { trpc } from "@/providers/trpc";
import { useSessionStore } from "@/stores/sessionStore";
import { useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = "/admin/login" } =
    options ?? {};

  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = trpc.auth.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const syncCart = trpc.cart.sync.useMutation();
  const sessionId = useSessionStore((s) => s.sessionId);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      if (sessionId) {
        await syncCart.mutateAsync({ sessionId });
      }
      await utils.invalidate();
      // Redirect based on role? Or just let the page handle it.
    },
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: async () => {
      // Maybe login automatically or just redirect to login
    },
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
      navigate("/");
    },
  });

  const login = useCallback((data: { email: string; password?: string; code?: string }) => {
    if (data.code) {
      return loginMutation.mutateAsync({ email: "admin@zendor.tools", password: data.code });
    }
    return loginMutation.mutateAsync({ email: data.email, password: data.password! });
  }, [loginMutation]);

  const register = useCallback((data: any) => registerMutation.mutateAsync(data), [registerMutation]);
  const logout = useCallback(() => logoutMutation.mutate(), [logoutMutation]);

  useEffect(() => {
    if (redirectOnUnauthenticated && !isLoading && !user) {
      const currentPath = window.location.pathname;
      if (currentPath !== redirectPath) {
        navigate(redirectPath);
      }
    }
  }, [redirectOnUnauthenticated, isLoading, user, navigate, redirectPath]);

  return useMemo(
    () => ({
      user: user ?? null,
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin",
      isLoading: isLoading || logoutMutation.isPending || loginMutation.isPending || registerMutation.isPending,
      error,
      login,
      register,
      logout,
      refresh: refetch,
    }),
    [user, isLoading, logoutMutation.isPending, loginMutation.isPending, registerMutation.isPending, error, login, register, logout, refetch],
  );
}
