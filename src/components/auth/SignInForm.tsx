"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await authService.login({ email, password });
      router.push("/dashboard"); // Redirect to dashboard on success
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="w-full">
      <div className="mb-4 text-center">
        <h1 className="mb-1 font-bold text-gray-900 text-xl dark:text-white sm:text-2xl tracking-tight">
          PeopleCentral Access
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          Enterprise Identity Management
        </p>
      </div>

      <form onSubmit={handleLogin}>
        <div className="space-y-4">
          {error && (
            <div className="p-4 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}
          <div>
            <Label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Email Address
            </Label>
            <Input
              placeholder="e.g. john@company.com"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 bg-white/50 px-5 py-2.5 text-gray-900 outline-none transition focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white"
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Password
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 bg-white/50 px-5 py-2.5 text-gray-900 outline-none transition focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {showPassword ? (
                  <EyeIcon className="w-5 h-5 fill-current" />
                ) : (
                  <EyeCloseIcon className="w-5 h-5 fill-current" />
                )}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox checked={isChecked} onChange={setIsChecked} />
              <span className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                Keep me logged in
              </span>
            </div>

          </div>
          <div>
            <Button
              className="w-full py-3 text-base font-bold shadow-lg shadow-brand-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              size="sm"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Authenticating..." : "Sign In to Workspace"}
            </Button>
          </div>
        </div>
      </form>


    </div >
  );
}
