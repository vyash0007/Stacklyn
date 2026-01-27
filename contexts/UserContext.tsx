"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types";
import { api } from "@/lib/api";
import { useRouter, usePathname } from "next/navigation";

interface UserContextType {
    user: User | null;
    login: (email: string, password?: string) => Promise<void>;
    signup: (name: string, email: string, password?: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const storedUserId = localStorage.getItem("stacklyn_user_id");
        if (storedUserId) {
            // Ideally we fetch user details here to verify validity
            fetchUser(storedUserId);
        } else {
            setIsLoading(false);
        }
    }, []);

    const fetchUser = async (id: string) => {
        try {
            // Just get all users and find logic for now if specific endpoint fails, 
            // but we have getUserById endpoint in api.ts? Not exposed yet.
            // Let's add getUserById to api.ts or use what's available.
            // Actually api.ts has getUsers() and createUser().
            // Let's rely on finding by email or id if we can.
            // For now, let's assume valid ID if in localstorage for speed, or verify.
            const users = await api.getUsers();
            const found = users.find(u => u.id === id);
            if (found) {
                setUser(found);
            } else {
                localStorage.removeItem("stacklyn_user_id");
            }
        } catch (e) {
            console.error("Auth check failed", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const publicPaths = ["/", "/login"];
        if (!isLoading && !user && !publicPaths.includes(pathname)) {
            router.push("/login");
        }
    }, [user, isLoading, pathname]);

    const login = async (email: string, password?: string) => {
        setIsLoading(true);
        try {
            if (!password) throw new Error("Password required");
            const { user, token } = await api.login({ email, password });
            setUser(user);
            localStorage.setItem("stacklyn_user_id", user.id);
            localStorage.setItem("stacklyn_token", token);
            router.push("/workspace/dashboard");
        } catch (e) {
            console.error("Login failed", e);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    const signup = async (name: string, email: string, password?: string) => {
        setIsLoading(true);
        try {
            if (!password) throw new Error("Password required");
            const { user, token } = await api.register({ email, password, name });
            setUser(user);
            localStorage.setItem("stacklyn_user_id", user.id);
            localStorage.setItem("stacklyn_token", token);
            router.push("/workspace/dashboard");
        } catch (e) {
            console.error("Signup failed", e);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("stacklyn_user_id");
        router.push("/login");
    };

    return (
        <UserContext.Provider value={{ user, login, signup, logout, isLoading }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
