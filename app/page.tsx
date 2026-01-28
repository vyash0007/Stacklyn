"use client";

import { LandingPage } from "@/components/landing/LandingPage";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/workspace/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return null; // or a loading spinner
  }

  if (isSignedIn) {
    return null; // Will redirect
  }

  return <LandingPage />;
}
