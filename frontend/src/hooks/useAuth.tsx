import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import AuthService from '../services/authService';

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
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  testApi: () => Promise<void>;
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

    // Initialize authentication state
    useEffect(() => {
        const initAuth = () => {
        const currentUser = AuthService.getCurrentUser();
        if (currentUser && AuthService.isAuthenticated()) {
            setUser(currentUser);
        }
        setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = async (username: string, password: string) => {
        setIsLoading(true);
        try {
        const response = await AuthService.login({ username, password });
        setUser(response.user);
        } catch (error) {
        console.error('Login error:', error);
        throw error;
        } finally {
        setIsLoading(false);
        }
    };

    const signup = async (userData: any) => {
        setIsLoading(true);
        try {
        const response = await AuthService.signup(userData);
        setUser(response.user);
        } catch (error) {
        console.error('Registration error:', error);
        throw error;
        } finally {
        setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
        await AuthService.logout();
        setUser(null);
        } catch (error) {
        console.error('Logout error:', error);
        } finally {
        setIsLoading(false);
        }
    };

    const testApi = async () => {
        try {
            const response = await AuthService.testApi();
            console.log('API Test:', response);
        } catch (error) {
            console.error('API Test failed:', error);
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
        testApi,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
