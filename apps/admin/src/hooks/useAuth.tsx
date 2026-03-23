import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from "react";
import { api } from "../lib/api";

interface User {
    id: number;
    email: string;
    name: string | null;
    avatar_url: string | null;
    role: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    loginWithGoogle: () => Promise<void>;
    handleGoogleCallback: (code: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const init = async () => {
            const token = api.getToken();
            if (!token) return;
            try {
                const res = await api.me();
                if (!cancelled) setUser(res.data);
            } catch {
                if (!cancelled) { api.setToken(null); setUser(null); }
            }
        };
        init().finally(() => { if (!cancelled) setIsLoading(false); });
        return () => { cancelled = true; };
    }, []);

    const loginWithGoogle = async () => {
        const res = await api.getGoogleAuthUrl();
        window.location.href = res.data.url;
    };

    const handleGoogleCallback = async (code: string) => {
        const redirectUri = `${window.location.origin}/login/callback`;
        const res = await api.googleCallback(code, redirectUri);
        api.setToken(res.data.token);
        setUser(res.data.user);
    };

    const logout = () => {
        api.setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, loginWithGoogle, handleGoogleCallback, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
}
