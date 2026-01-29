import { SignUpLayout } from "@/components/auth/SignUpLayout";
import CustomSignUp from "@/components/auth/CustomSignUp";

export default function SignUpPage() {
    return (
        <SignUpLayout
            title={<>The future of AI is yours to build</>}
        >
            <CustomSignUp />
        </SignUpLayout>
    );
}
