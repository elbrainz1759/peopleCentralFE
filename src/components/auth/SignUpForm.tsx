"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { userService } from "@/services/user.service";
import { toast } from "react-hot-toast";
import CustomSelect from "@/components/form/CustomSelect";

const STEPS = [
  { id: 1, label: "Personal" },
  { id: 2, label: "Work" },
  { id: 3, label: "Review" },
] as const;

export default function SignUpForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const [departments, setDepartments] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    staffId: "",
    email: "",
    designation: "",
    locationId: "",
    programId: "",
    departmentId: "",
    countryId: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [deptsRes, progsRes, countriesRes, locsRes] = await Promise.all([
          userService.getAllDepartments().catch(() => []),
          userService.getAllPrograms().catch(() => []),
          userService.getAllCountries().catch(() => []),
          userService.getAllLocations().catch(() => []),
        ]);

        setDepartments((deptsRes as any)?.data || (Array.isArray(deptsRes) ? deptsRes : []));
        setPrograms((progsRes as any)?.data || (Array.isArray(progsRes) ? progsRes : []));
        setCountries((countriesRes as any)?.data || (Array.isArray(countriesRes) ? countriesRes : []));
        setLocations((locsRes as any)?.data || (Array.isArray(locsRes) ? locsRes : []));
      } catch (err) {
        console.error("Failed to load form data", err);
      } finally {
        setIsFetchingData(false);
      }
    };
    loadData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isMercyEmail = (email: string) => /^[^@]+@mercycorps\.org$/i.test(email);

  // Validates the fields on the current step before moving forward.
  const validateStep = (current: 1 | 2): string | null => {
    if (current === 1) {
      if (!formData.firstName.trim() || !formData.lastName.trim()) return "Enter your first and last name.";
      if (!formData.staffId.trim()) return "Enter your staff ID.";
      if (!formData.email.trim()) return "Enter your work email.";
      if (!isMercyEmail(formData.email)) {
        setShowEmailModal(true);
        return null;
      }
      return null;
    }
    if (!formData.countryId) return "Choose your country.";
    if (!formData.departmentId) return "Choose your department.";
    if (!formData.locationId) return "Choose your location.";
    if (!formData.programId) return "Choose your program.";
    return null;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 3) return;
    const problem = validateStep(step);
    if (problem) {
      setError(problem);
      return;
    }
    if (step === 1 && !isMercyEmail(formData.email)) return;
    setError(null);
    setStep((s) => (s === 1 ? 2 : 3));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!isMercyEmail(formData.email)) {
      setShowEmailModal(true);
      setIsSubmitting(false);
      return;
    }

    try {
      await userService.createEmployee({
        firstName: formData.firstName,
        lastName: formData.lastName,
        staffId: parseInt(formData.staffId, 10),
        email: formData.email,
        status: "Active",
        designation: formData.designation,
        locationId: formData.locationId,
        programId: formData.programId,
        departmentId: formData.departmentId,
        countryId: formData.countryId,
      });

      toast.success("Employee account created successfully! Kindly reach out to HR for account approval.");
      if (onSuccess) onSuccess();
      router.push("/signin");
    } catch (err: any) {
      const message = err.message || "Failed to create employee account";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass =
    "w-full rounded-xl border border-[#e4dfd9] bg-[#f5f3f0] px-4 py-3 text-[15px] text-[#1d1b1a] outline-none transition placeholder:text-[#9a9189] focus:border-[#c4232f] focus:ring-4 focus:ring-[#fbe9ea] dark:border-[#353029] dark:bg-[#161413] dark:text-[#f3efea] dark:placeholder:text-[#6f675f] dark:focus:border-[#e0484f] dark:focus:ring-[#3a1d1f]";
  const labelClass = "text-[13px] font-semibold text-[#1d1b1a] dark:text-[#f3efea]";
  const requiredMark = <span className="text-[#c4232f]"> *</span>;
  const primaryBtn =
    "w-full rounded-xl bg-[#c4232f] px-4 py-3.5 text-[15px] font-semibold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#fbe9ea] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#e0484f] dark:focus-visible:ring-[#3a1d1f]";
  const secondaryBtn =
    "w-full rounded-xl border border-[#e4dfd9] bg-transparent px-4 py-3.5 text-[15px] font-semibold text-[#1d1b1a] transition hover:bg-[#f5f3f0] dark:border-[#353029] dark:text-[#f3efea] dark:hover:bg-[#211e1c]";

  const countryName = countries.find((c: any) => c.unique_id === formData.countryId)?.name ?? "";
  const departmentName = departments.find((d: any) => d.unique_id === formData.departmentId)?.name ?? "";
  const locationName = locations.find((l: any) => l.unique_id === formData.locationId)?.name ?? "";
  const programName = programs.find((p: any) => p.unique_id === formData.programId)?.name ?? "";

  if (isFetchingData) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#c4232f]/20 border-t-[#c4232f] dark:border-t-[#e0484f]" />
        <p className="text-[14px] text-[#6b655f] dark:text-[#a39b93]">Loading form data…</p>
      </div>
    );
  }

  const titles: Record<1 | 2 | 3, { title: string; sub: string }> = {
    1: { title: "Personal Information", sub: "Tell us a little about yourself." },
    2: { title: "Work Information", sub: "Where are you based and what team do you work with?" },
    3: { title: "Review your details", sub: "Check everything is right before you submit." },
  };

  return (
    <div>
      {showEmailModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowEmailModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl dark:bg-[#211e1c]"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#fbe9ea] dark:bg-[#3a1d1f]">
              <svg className="h-6 w-6 text-[#c4232f] dark:text-[#e0484f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-[16px] font-semibold text-[#1d1b1a] dark:text-[#f3efea]">Use your Mercy Corps email</h3>
            <p className="mt-1.5 text-[14px] text-[#6b655f] dark:text-[#a39b93]">
              Only <span className="font-semibold text-[#c4232f] dark:text-[#e0484f]">@mercycorps.org</span> addresses can register.
            </p>
            <button
              type="button"
              onClick={() => setShowEmailModal(false)}
              className="mt-5 w-full rounded-xl bg-[#c4232f] px-4 py-3 text-[14px] font-semibold text-white hover:brightness-110 dark:bg-[#e0484f]"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Progress: Personal → Work → Review */}
      <ol className="mb-8 flex items-center" aria-label="Registration progress">
        {STEPS.map((s, i) => {
          const done = step > s.id;
          const active = step === s.id;
          return (
            <li key={s.id} className="flex flex-1 items-center last:flex-none">
              <div className="flex items-center gap-2.5">
                <span
                  aria-current={active ? "step" : undefined}
                  className={`flex h-7 w-7 flex-none items-center justify-center rounded-full text-[13px] font-semibold transition ${
                    done
                      ? "bg-[#c4232f] text-white dark:bg-[#e0484f]"
                      : active
                      ? "bg-[#c4232f] text-white ring-4 ring-[#fbe9ea] dark:bg-[#e0484f] dark:ring-[#3a1d1f]"
                      : "border border-[#d9d2ca] text-[#6b655f] dark:border-[#4a423a] dark:text-[#a39b93]"
                  }`}
                >
                  {done ? "✓" : s.id}
                </span>
                <span
                  className={`whitespace-nowrap text-[13px] font-semibold ${
                    active || done ? "text-[#1d1b1a] dark:text-[#f3efea]" : "text-[#8f877f] dark:text-[#7d756d]"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <span
                  className={`mx-3 h-px flex-1 ${
                    step > s.id ? "bg-[#c4232f] dark:bg-[#e0484f]" : "bg-[#e4dfd9] dark:bg-[#353029]"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>

      <div className="mb-7">
        <h1 className="text-[26px] font-semibold tracking-[-0.01em] text-[#1d1b1a] dark:text-[#f3efea]">
          {titles[step].title}
        </h1>
        <p className="mt-1.5 text-[15px] text-[#6b655f] dark:text-[#a39b93]">{titles[step].sub}</p>
      </div>

      <form onSubmit={step === 3 ? handleSubmit : handleNext} className="grid gap-6">
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-[#f3c5c8] bg-[#fbe9ea] px-4 py-3 text-[14px] text-[#8f1d26] dark:border-[#5a2327] dark:bg-[#3a1d1f] dark:text-[#ffb4b9]"
          >
            {error}
          </div>
        )}

        {step === 1 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label htmlFor="su-first" className={labelClass}>First name{requiredMark}</label>
                <input id="su-first" type="text" name="firstName" placeholder="Amina" autoComplete="given-name"
                  value={formData.firstName} onChange={handleInputChange} className={fieldClass} />
              </div>
              <div className="grid gap-2">
                <label htmlFor="su-last" className={labelClass}>Last name{requiredMark}</label>
                <input id="su-last" type="text" name="lastName" placeholder="Bello" autoComplete="family-name"
                  value={formData.lastName} onChange={handleInputChange} className={fieldClass} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label htmlFor="su-staff" className={labelClass}>Staff ID{requiredMark}</label>
                <input id="su-staff" type="number" name="staffId" placeholder="e.g. 1042" inputMode="numeric"
                  value={formData.staffId} onChange={handleInputChange} className={fieldClass} />
              </div>
              <div className="grid gap-2">
                <label htmlFor="su-desig" className={labelClass}>Designation</label>
                <input id="su-desig" type="text" name="designation" placeholder="e.g. Program Officer"
                  value={formData.designation} onChange={handleInputChange} className={fieldClass} />
              </div>
            </div>
            <div className="grid gap-2">
              <label htmlFor="su-email" className={labelClass}>Work email{requiredMark}</label>
              <input id="su-email" type="email" name="email" placeholder="you@mercycorps.org" autoComplete="email"
                value={formData.email} onChange={handleInputChange} className={fieldClass} />
              <span className="text-[12px] text-[#6b655f] dark:text-[#a39b93]">Must end in @mercycorps.org</span>
            </div>
            <button type="submit" className={primaryBtn}>Continue</button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <span className={labelClass}>Country{requiredMark}</span>
                <CustomSelect
                  value={formData.countryId}
                  onChange={(v) => setFormData((prev) => ({ ...prev, countryId: v, locationId: "" }))}
                  options={countries.map((c: any) => ({ value: c.unique_id, label: c.name }))}
                  placeholder="Select country"
                />
              </div>
              <div className="grid gap-2">
                <span className={labelClass}>Department{requiredMark}</span>
                <CustomSelect
                  value={formData.departmentId}
                  onChange={(v) => setFormData((prev) => ({ ...prev, departmentId: v }))}
                  options={departments.map((d: any) => ({ value: d.unique_id, label: d.name }))}
                  placeholder="Select department"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <span className={labelClass}>Location{requiredMark}</span>
                <CustomSelect
                  value={formData.locationId}
                  onChange={(v) => setFormData((prev) => ({ ...prev, locationId: v }))}
                  options={locations
                    .filter((l: any) => !formData.countryId || l.country_id === formData.countryId)
                    .map((l: any) => ({ value: l.unique_id, label: l.name }))}
                  placeholder={formData.countryId ? "Select location" : "Select a country first"}
                />
              </div>
              <div className="grid gap-2">
                <span className={labelClass}>Program{requiredMark}</span>
                <CustomSelect
                  value={formData.programId}
                  onChange={(v) => setFormData((prev) => ({ ...prev, programId: v }))}
                  options={programs.map((p: any) => ({ value: p.unique_id, label: p.name }))}
                  placeholder="Select program"
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <button type="button" className={secondaryBtn} onClick={() => { setError(null); setStep(1); }}>Back</button>
              <button type="submit" className={primaryBtn}>Continue</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <dl className="grid gap-px overflow-hidden rounded-2xl border border-[#e4dfd9] bg-[#e4dfd9] text-[14px] dark:border-[#353029] dark:bg-[#353029]">
              {[
                ["Name", `${formData.firstName} ${formData.lastName}`.trim()],
                ["Staff ID", formData.staffId],
                ["Work email", formData.email],
                ["Designation", formData.designation || "—"],
                ["Country", countryName],
                ["Department", departmentName],
                ["Location", locationName],
                ["Program", programName],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-4 bg-white px-4 py-3 dark:bg-[#211e1c]">
                  <dt className="text-[#6b655f] dark:text-[#a39b93]">{k}</dt>
                  <dd className="min-w-0 truncate text-right font-medium text-[#1d1b1a] dark:text-[#f3efea]">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="text-[13px] text-[#6b655f] dark:text-[#a39b93]">
              After you submit, HR reviews your account. You can sign in once it is approved.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <button type="button" className={secondaryBtn} onClick={() => { setError(null); setStep(2); }}>Back</button>
              <button type="submit" disabled={isSubmitting} className={primaryBtn}>
                {isSubmitting ? "Creating account…" : "Create account"}
              </button>
            </div>
          </>
        )}
      </form>

      <p className="mt-7 text-center text-[14px] text-[#6b655f] dark:text-[#a39b93]">
        Already have an account?{" "}
        <a href="/" className="font-semibold text-[#1d1b1a] underline-offset-4 hover:underline dark:text-[#f3efea]">
          Sign in
        </a>
      </p>
    </div>
  );
}
