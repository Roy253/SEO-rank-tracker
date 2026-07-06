import axios, { type AxiosInstance } from "axios";
import {
    createContext,
    type ReactNode,
    useState,
    useEffect,
    type Dispatch,
    type SetStateAction,
    useContext,
    useMemo,
} from "react";

interface User {
    id: string;
    name: string;
    email: string;
    plan?: string;
    analysisCount?: number;
}

interface AppContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    setLoading: Dispatch<SetStateAction<boolean>>;
    api: AxiosInstance;

    login: (
        email: string,
        password: string
    ) => Promise<{ success: boolean; message?: string }>;

    register: (
        name: string,
        email: string,
        password: string
    ) => Promise<{ success: boolean; message?: string }>;

    logout: () => void;
}

const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const AppContext = createContext<AppContextType | undefined>(undefined);

function AppProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(
        localStorage.getItem("token")
    );
    const [loading, setLoading] = useState(true);

    const api = useMemo(() => {
        const instance = axios.create({
            baseURL: BACKEND_URL,
        });

        instance.interceptors.request.use((config) => {
            const storedToken = localStorage.getItem("token");

            if (storedToken) {
                config.headers.Authorization = `Bearer ${storedToken}`;
            }

            return config;
        });

        return instance;
    }, []);

    const loadUser = async () => {
        const storedToken = localStorage.getItem("token");

        if (!storedToken) {
            setLoading(false);
            return;
        }

        try {
            const response = await api.get("/api/auth/user");

            setUser(response.data.user);
            setToken(storedToken);
        } catch (error) {
            console.error("Failed to load user:", error);

            setUser(null);
            setToken(null);
            localStorage.removeItem("token");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    const login = async (
        email: string,
        password: string
    ): Promise<{ success: boolean; message?: string }> => {
        setLoading(true);

        try {
            const response = await api.post("/api/auth/login", {
                email,
                password,
            });

            const { user, token } = response.data;

            localStorage.setItem("token", token);

            setUser(user);
            setToken(token);

            return {
                success: true,
                message: "Login successful",
            };
        } catch (error: any) {
            console.error("Login error:", error);

            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    error.message ||
                    "Invalid credentials",
            };
        } finally {
            setLoading(false);
        }
    };

    const register = async (
        name: string,
        email: string,
        password: string
    ): Promise<{ success: boolean; message?: string }> => {
        setLoading(true);

        try {
            const response = await api.post("/api/auth/register", {
                name,
                email,
                password,
            });

            const { user, token } = response.data;

            localStorage.setItem("token", token);

            setUser(user);
            setToken(token);

            return {
                success: true,
                message: "Registration successful",
            };
        } catch (error: any) {
            console.error("Registration error:", error);

            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    error.message ||
                    "Registration failed",
            };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        setToken(null);
    };

    const value: AppContextType = {
        user,
        token,
        loading,
        setLoading,
        api,
        login,
        register,
        logout,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);

    if (!context) {
        throw new Error("useApp must be used within an AppProvider");
    }

    return context;
}

export default AppProvider;