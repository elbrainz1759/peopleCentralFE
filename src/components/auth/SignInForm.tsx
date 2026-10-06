"use client";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const fieldClass =
  "w-full rounded-xl border border-[#e4dfd9] bg-[#f5f3f0] px-4 py-3 text-[15px] text-[#1d1b1a] outline-none transition placeholder:text-[#9a9189] focus:border-[#c4232f] focus:ring-4 focus:ring-[#fbe9ea] dark:border-[#353029] dark:bg-[#161413] dark:text-[#f3efea] dark:placeholder:text-[#6f675f] dark:focus:border-[#e0484f] dark:focus:ring-[#3a1d1f]";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
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
      const response = await authService.login({ email, password });
      const user = (response as any).user;
      if (user?.passChanged === 0 || user?.pass_changed === 0 || user?.passChanged === false) {
        router.push("/change-password");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#c4232f] dark:text-[#e0484f]">
          Staff sign in
        </p>
        <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.01em] text-[#1d1b1a] dark:text-[#f3efea]">
          Welcome back
        </h1>
        <p className="mt-2 text-[15px] text-[#6b655f] dark:text-[#a39b93]">
          Sign in with your Mercy Corps email.
        </p>
      </div>

      <form onSubmit={handleLogin} className="grid gap-5">
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-[#f3c5c8] bg-[#fbe9ea] px-4 py-3 text-[14px] text-[#8f1d26] dark:border-[#5a2327] dark:bg-[#3a1d1f] dark:text-[#ffb4b9]"
          >
            {error}
          </div>
        )}

        <div className="grid gap-2">
          <label htmlFor="signin-email" className="text-[13px] font-semibold text-[#1d1b1a] dark:text-[#f3efea]">
            Work email
          </label>
          <input
            id="signin-email"
            type="email"
            autoComplete="email"
            placeholder="you@mercycorps.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={fieldClass}
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="signin-password" className="text-[13px] font-semibold text-[#1d1b1a] dark:text-[#f3efea]">
            Password
          </label>
          <div className="relative">
            <input
              id="signin-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`${fieldClass} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[#6b655f] hover:text-[#1d1b1a] dark:text-[#a39b93] dark:hover:text-[#f3efea]"
            >
              {showPassword ? (
                <EyeIcon className="h-5 w-5 fill-current" />
              ) : (
                <EyeCloseIcon className="h-5 w-5 fill-current" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 text-[14px]">
          <label className="flex cursor-pointer items-center gap-2.5 text-[#6b655f] dark:text-[#a39b93]">
            <input
              type="checkbox"
              checked={keepSignedIn}
              onChange={(e) => setKeepSignedIn(e.target.checked)}
              className="h-4 w-4 cursor-pointer accent-[#c4232f] dark:accent-[#e0484f]"
            />
            Keep me signed in
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-[#c4232f] px-4 py-3.5 text-[15px] font-semibold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#fbe9ea] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#e0484f] dark:focus-visible:ring-[#3a1d1f]"
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>

        <div className="flex items-center gap-3 text-[12px] uppercase tracking-[0.12em] text-[#9a9189] dark:text-[#6f675f]">
          <span className="h-px flex-1 bg-[#e4dfd9] dark:bg-[#353029]" />
          New here?
          <span className="h-px flex-1 bg-[#e4dfd9] dark:bg-[#353029]" />
        </div>

        <p className="text-center text-[14px] text-[#6b655f] dark:text-[#a39b93]">
          Need an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-[#1d1b1a] underline-offset-4 hover:underline dark:text-[#f3efea]"
          >
            Create one
          </Link>
        </p>
      </form>
    </div>
  );
}
