"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { setAuthToken } from "@/lib/api";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { getToken, isLoaded, isSignedIn } = useAuth();

    useEffect(() => {
        console.log("AuthProvider mounted - isLoaded:", isLoaded, "isSignedIn:", isSignedIn);
        if (isLoaded) {
            setAuthToken(getToken);
        }
    }, [getToken, isLoaded, isSignedIn]);

    return <>{children}</>;
}
