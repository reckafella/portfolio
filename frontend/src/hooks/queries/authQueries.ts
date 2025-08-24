import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AuthService, { LoginCredentials, RegisterData } from '../../services/authService';

// Auth-related query keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  formConfigs: () => [...authKeys.all, 'formConfigs'] as const,
  loginConfig: () => [...authKeys.formConfigs(), 'login'] as const,
  signupConfig: () => [...authKeys.formConfigs(), 'signup'] as const,
};

// Auth API functions
const authApiFunctions = {
  async getUser() {
    // Use existing user from localStorage if available
    const user = AuthService.getCurrentUser();
    if (user && AuthService.isAuthenticated()) {
      return user;
    }
    throw new Error('Not authenticated');
  },

  async login(credentials: LoginCredentials) {
    return AuthService.login(credentials);
  },

  async signup(userData: RegisterData) {
    return AuthService.signup(userData);
  },

  async logout() {
    return AuthService.logout();
  },

  async getLoginFormConfig() {
    const response = await fetch('/api/v1/auth/login-form-config/');
    if (!response.ok) {
      throw new Error('Failed to fetch login form config');
    }
    return response.json();
  },

  async getSignupFormConfig() {
    const response = await fetch('/api/v1/auth/signup-form-config/');
    if (!response.ok) {
      throw new Error('Failed to fetch signup form config');
    }
    return response.json();
  },
};

// Queries
export const useUser = () => {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: authApiFunctions.getUser,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useLoginFormConfig = () => {
  return useQuery({
    queryKey: authKeys.loginConfig(),
    queryFn: authApiFunctions.getLoginFormConfig,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

export const useSignupFormConfig = () => {
  return useQuery({
    queryKey: authKeys.signupConfig(),
    queryFn: authApiFunctions.getSignupFormConfig,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

// Mutations
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authApiFunctions.login,
    onSuccess: (data) => {
      // Update user cache with the logged-in user data
      queryClient.setQueryData(authKeys.user(), data.user);
      // Invalidate and refetch user-related queries
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });
};

export const useSignup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authApiFunctions.signup,
    onSuccess: (data) => {
      // Update user cache with the newly created user data
      queryClient.setQueryData(authKeys.user(), data.user);
      // Invalidate and refetch user-related queries
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authApiFunctions.logout,
    onSuccess: () => {
      // Clear all cached data on logout
      queryClient.clear();
    },
    onError: () => {
      // Clear cache even on error to ensure clean state
      queryClient.clear();
    },
  });
};
