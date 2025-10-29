import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import AuthService, {AuthResponse, RegisterData} from '@/services/authService';
import { tabSyncService, TabSyncMessage } from '@/services/tabSyncService';

interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_staff: boolean;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (_username: string, _password: string) => Promise<AuthResponse>;
    signup: (_userData: RegisterData) => Promise<AuthResponse>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Export the hook separately for better Fast Refresh compatibility
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Make this the default export to fix Fast Refresh
export default function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const queryClient = useQueryClient();

    // Initialize authentication state
    useEffect(() => {
        const initAuth = () => {
            // Check for Django authentication first (from hidden div)
            const userLoggedInDiv = document.getElementById('user-logged-in');
            if (userLoggedInDiv) {
                // User is authenticated in Django, get user info from localStorage or API
                const currentUser = AuthService.getCurrentUser();
                if (currentUser && AuthService.isAuthenticated()) {
                    setUser(currentUser);
                } else {
                    // If no localStorage data, fetch from Django session
                    fetchUserFromSession();
                }
            } else {
                // Check localStorage anyway in case of client-side auth
                const currentUser = AuthService.getCurrentUser();
                if (currentUser && AuthService.isAuthenticated()) {
                    setUser(currentUser);
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    // Listen for cross-tab authentication changes
    useEffect(() => {
        const handleTabSyncMessage = (message: TabSyncMessage) => {
            switch (message.type) {
                case 'AUTH_LOGIN':
                case 'AUTH_SIGNUP':
                    // Another tab logged in or signed up
                    if (message.payload.user) {
                        setUser(message.payload.user);
                        // Invalidate all queries to refetch with new auth state
                        queryClient.invalidateQueries();
                    }
                    break;

                case 'AUTH_LOGOUT':
                    // Another tab logged out
                    setUser(null);
                    // Clear all cached queries on logout
                    queryClient.clear();
                    // Optionally reload the page to update Django context
                    window.location.reload();
                    break;
            }
        };

        // Register the listener
        tabSyncService.addListener(handleTabSyncMessage);

        // Cleanup on unmount
        return () => {
            tabSyncService.removeListener(handleTabSyncMessage);
        };
    }, [queryClient]);

    // Fetch user data from Django session
    const fetchUserFromSession = async () => {
        try {
            const response = await fetch('/api/auth/user/', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                // Store in localStorage for consistency
                localStorage.setItem('user', JSON.stringify(userData));
            }
        } catch (error) {
            // Silently fail - user may not be authenticated
            console.error('Failed to fetch user from session:', error);
        }
    };

    const login = async (username: string, password: string): Promise<AuthResponse> => {
        setIsLoading(true);
        try {
            const response = await AuthService.login({ username, password });
            setUser(response.user);
            return response;
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
    };

    const signup = async (userData: RegisterData): Promise<AuthResponse> => {
        setIsLoading(true);
        try {
            const response = await AuthService.signup(userData);
            setUser(response.user);
            return response;
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await AuthService.logout();
            setUser(null);
            // Trigger a page reload to update Django template context
            window.location.reload();
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
