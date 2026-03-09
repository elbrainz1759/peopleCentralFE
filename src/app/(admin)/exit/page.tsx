"use client";
import MultiStepExitForm from "@/components/exit/MultiStepExitForm";

export default function ExitPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="py-6">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-title-md2 font-bold text-black dark:text-white">
                Exit Request
              </h2>
              <nav>
                <ol className="flex items-center gap-2">
                  <li>
                    <a className="font-medium" href="/">
                      Dashboard /
                    </a>
                  </li>
                  <li className="font-medium text-brand-500">Exit Request</li>
                </ol>
              </nav>
            </div>
          </div>

          <MultiStepExitForm />
        </div>
      </div>
    </div>
  );
}
