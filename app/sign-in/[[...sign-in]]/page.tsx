import { SignInLayout } from "@/components/auth/SignInLayout";
import CustomSignIn from "@/components/auth/CustomSignIn";

export default function SignInPage() {
    return (
        <SignInLayout
            badge="Welcome Back"
            title={<>Resume your <br />AI engineering</>}
        >
            <CustomSignIn />
        </SignInLayout>
    );
}
