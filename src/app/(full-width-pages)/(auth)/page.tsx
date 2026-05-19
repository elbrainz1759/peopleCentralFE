import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Mercy Corps People Central",
  description: "Sign in to Mercy Corps People Central HR Management System",
};

export default function SignIn() {
  return <SignInForm />;
}
