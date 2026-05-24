import type { Metadata } from "next";
import ChangePasswordForm from "@/components/auth/ChangePasswordForm";

export const metadata: Metadata = {
    title: "Set New Password | PeopleCentral",
};

export default function ChangePasswordPage() {
    return <ChangePasswordForm />;
}
