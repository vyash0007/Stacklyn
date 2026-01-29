import { SignInLayout } from "@/components/auth/SignInLayout";
import CustomSignIn from "@/components/auth/CustomSignIn";

export default function SignInPage() {
    return (
        <SignInLayout
            title={<>Resume your AI engineering</>}
        >
            <CustomSignIn />
        </SignInLayout>
    );
}
