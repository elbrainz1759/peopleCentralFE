import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "User Management | HR Dashboard",
  description: "User management has been moved to HR Administration",
};

export default function SignUp() {
  redirect("/hr/users");
}
