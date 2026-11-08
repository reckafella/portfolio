import {
    useState,
    useEffect,
    createContext,
    useContext,
    ReactNode,
    useCallback,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import AuthService, {
    AuthResponse,
    RegisterData,
} from "@/services/authService";
import { tabSyncService, TabSyncMessage } from "@/services/tabSyncService";
import {
    AUTH_SESSION_EXPIRED_EVENT,
    clearExpiredAuthSession,
} from "@/utils/authSession";

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
        throw new Error("useAuth must be used within an AuthProvider");
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

    // Validate cached auth data against the server before allowing protected routes.
    useEffect(() => {
        let isMounted = true;

        const initializeAuth = async () => {
            const cachedUser = AuthService.getCurrentUser();
            const hasDjangoSessionContext =
                document.getElementById("user-logged-in") !== null;

            if (!cachedUser && !hasDjangoSessionContext) {
                setUser(null);
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch("/api/auth/user/", {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "X-Requested-With": "XMLHttpRequest",
                        "Content-Type": "application/json",
                    },
                });

                if (response.ok) {
                    const currentUser: User = await response.json();
                    if (isMounted) {
                        setUser(currentUser);
                        localStorage.setItem(
                            "user",
                            JSON.stringify(currentUser),
                        );
                    }
                } else if (response.status === 401) {
                    clearExpiredAuthSession();
                    if (isMounted) {
                        setUser(null);
                        queryClient.clear();
                    }
                } else if (cachedUser && isMounted) {
                    setUser(cachedUser);
                }
            } catch {
                // Keep cached auth during temporary network failures; protected API
                // responses will invalidate it if the server rejects the session.
                if (cachedUser && isMounted) {
                    setUser(cachedUser);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        void initializeAuth();
        return () => {
            isMounted = false;
        };
    }, [queryClient]);

    useEffect(() => {
        const handleExpiredSession = () => {
            setUser(null);
            queryClient.clear();
        };

        window.addEventListener(
            AUTH_SESSION_EXPIRED_EVENT,
            handleExpiredSession,
        );
        return () =>
            window.removeEventListener(
                AUTH_SESSION_EXPIRED_EVENT,
                handleExpiredSession,
            );
    }, [queryClient]);

    // Listen for cross-tab authentication changes
    useEffect(() => {
        const handleTabSyncMessage = (message: TabSyncMessage) => {
            switch (message.type) {
                case "AUTH_LOGIN":
                case "AUTH_SIGNUP":
                    // Another tab logged in or signed up
                    if (message.payload.user) {
                        setUser(message.payload.user);
                        // Invalidate all queries to refetch with new auth state
                        queryClient.invalidateQueries();
                    }
                    break;

                case "AUTH_LOGOUT":
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

    const login = async (
        username: string,
        password: string,
    ): Promise<AuthResponse> => {
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

    const logout = useCallback(async () => {
        setIsLoading(true);
        try {
            await AuthService.logout();
            setUser(null);
            queryClient.clear();
        } finally {
            setIsLoading(false);
        }
    }, [queryClient]);

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}
