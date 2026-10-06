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
    <div className="min-h-screen bg-[#f5f3f0] text-[#1d1b1a] dark:bg-[#161413] dark:text-[#f3efea] lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <ThemeProvider>
        {/* Brand panel — desktop only */}
        <aside className="relative hidden overflow-hidden bg-[#1d1b1a] text-[#f5f3f0] dark:bg-[#0f0d0c] lg:flex lg:flex-col lg:justify-between lg:p-12">
          <div className="inline-flex w-fit items-center rounded-2xl bg-white px-5 py-3">
            <Image
              width={180}
              height={64}
              src="/images/logo/brand-logo.png"
              alt="Mercy Corps"
              className="h-10 w-auto"
              unoptimized={true}
            />
          </div>

          <div className="max-w-[30ch]">
            <h2 className="text-[34px] font-semibold leading-[1.15] tracking-[-0.01em] text-balance">
              Your people, your records, one place.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[#b9b1a8] dark:text-[#8f877f]">
              Leave, exits and staff records for Mercy Corps teams across the country.
            </p>
          </div>

          <ul className="grid gap-3 text-[14px] text-[#b9b1a8] dark:text-[#8f877f]">
            {[
              "Request and approve leave in a few taps",
              "Track exit clearance from supervisor to HR",
              "Keep staff details current in one place",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[#c4232f] dark:bg-[#e0484f]" />
                {item}
              </li>
            ))}
          </ul>

          <p className="text-[12px] tracking-wide text-[#b9b1a8] dark:text-[#8f877f]">
            Mercy Corps Nigeria · Staff access only
          </p>
        </aside>

        {/* Form column */}
        <main className="flex min-h-screen flex-col justify-center px-5 py-10 sm:px-10">
          <div className="mx-auto w-full max-w-[480px]">
            <Link href="/" className="mb-10 inline-flex items-center lg:hidden">
              <Image
                width={180}
                height={64}
                src="/images/logo/brand-logo.png"
                alt="Mercy Corps"
                className="h-10 w-auto"
                unoptimized={true}
              />
            </Link>
            {children}
            <p className="mt-10 text-center text-[12px] text-[#6b655f] dark:text-[#a39b93]">
              &copy; {new Date().getFullYear()} PeopleCentral · Mercy Corps
            </p>
          </div>
        </main>

        <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
          <ThemeTogglerTwo />
        </div>
      </ThemeProvider>
    </div>
  );
}
