import GridShape from "@/components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";

import { ThemeProvider } from "@/context/ThemeContext";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen z-1 bg-gray-50 dark:bg-gray-950 overflow-hidden flex items-center justify-center">
      <ThemeProvider>
        <div className="relative z-10 w-full max-w-[480px] p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="p-4 sm:p-6">
              <div className="flex justify-center mb-4">
                <Link href="/">
                  <Image
                    width={320}
                    height={91}
                    src="/images/logo-brand.png"
                    alt="PeopleCentral Logo"
                    className="h-auto w-auto max-h-[140px]"
                    unoptimized={true}
                  />
                </Link>
              </div>
              {children}
            </div>
          </div>

          <div className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} PeopleCentral. Enterprise Identity.
          </div>
        </div>

        <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
          <ThemeTogglerTwo />
        </div>
      </ThemeProvider>
    </div>
  );
}
