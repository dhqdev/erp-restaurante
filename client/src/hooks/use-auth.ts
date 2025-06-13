import { useState, useEffect } from "react";
import { authApi, type User } from "@/lib/auth";

interface AuthState {
  user: User | null;
  trialDaysLeft: number;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    trialDaysLeft: 0,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const authResponse = await authApi.getCurrentUser();
      if (authResponse) {
        setState({
          user: authResponse.user,
          trialDaysLeft: authResponse.trialDaysLeft,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setState({
          user: null,
          trialDaysLeft: 0,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      setState({
        user: null,
        trialDaysLeft: 0,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const authResponse = await authApi.login(credentials);
      setState({
        user: authResponse.user,
        trialDaysLeft: authResponse.trialDaysLeft,
        isLoading: false,
        isAuthenticated: true,
      });
      return authResponse;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await authApi.logout();
    setState({
      user: null,
      trialDaysLeft: 0,
      isLoading: false,
      isAuthenticated: false,
    });
  };

  return {
    ...state,
    login,
    logout,
    refetch: checkAuth,
  };
}
