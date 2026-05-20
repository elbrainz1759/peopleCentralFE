import { Metadata } from "next";
import SignUpForm from "@/components/auth/SignUpForm";

export const metadata: Metadata = {
  title: "Create Employee Account | PeopleCentral",
  description: "Create a new employee user account",
};

export default function SignUpPage() {
  return <SignUpForm />;
}
