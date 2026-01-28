import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
            <SignIn
                appearance={{
                    elements: {
                        rootBox: "mx-auto",
                        card: "shadow-2xl",
                        headerTitle: "text-2xl font-bold",
                        headerSubtitle: "text-slate-600"
                    }
                }}
                fallbackRedirectUrl="/workspace/dashboard"
                signUpUrl="/sign-up"
            />
        </div>
    );
}
