import { SignUpLayout } from "@/components/auth/SignUpLayout";
import CustomSignUp from "@/components/auth/CustomSignUp";

export default function SignUpPage() {
    return (
        <SignUpLayout
            badge="Get Started"
            title={<>The future of <br />AI is yours to build</>}
        >
            <CustomSignUp />
        </SignUpLayout>
    );
}
