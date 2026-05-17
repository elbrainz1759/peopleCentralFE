"use client";

import { authService } from "@/services/auth.service";
import { useEffect } from "react";

export default function LogoutPage() {
  useEffect(() => {
    authService.logout();
  }, []);

  return (
    <div className="w-full text-center py-8">
      <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-brand-500 dark:border-gray-700 dark:border-t-brand-400" />
      <h1 className="mb-1 font-bold text-gray-900 text-xl dark:text-white sm:text-2xl tracking-tight">
        Signing you out
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
        Clearing your session…
      </p>
    </div>
  );
}
