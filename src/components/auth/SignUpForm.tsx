"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { userService } from "@/services/user.service";
import { toast } from "react-hot-toast";
import CustomSelect from "@/components/form/CustomSelect";

export default function SignUpForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!/^[^@]+@mercycorps\.org$/i.test(formData.email)) {
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
  const sectionTitleClass =
    "text-[12px] font-semibold uppercase tracking-[0.14em] text-[#6b655f] dark:text-[#a39b93]";

  if (isFetchingData) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#c4232f]/20 border-t-[#c4232f] dark:border-t-[#e0484f]" />
        <p className="text-[14px] text-[#6b655f] dark:text-[#a39b93]">Loading form data…</p>
      </div>
    );
  }

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

      <div className="mb-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#c4232f] dark:text-[#e0484f]">
          New staff account
        </p>
        <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.01em] text-[#1d1b1a] dark:text-[#f3efea]">
          Create your account
        </h1>
        <p className="mt-2 text-[15px] text-[#6b655f] dark:text-[#a39b93]">
          HR reviews new accounts before you can sign in. Takes about two minutes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-7">
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-[#f3c5c8] bg-[#fbe9ea] px-4 py-3 text-[14px] text-[#8f1d26] dark:border-[#5a2327] dark:bg-[#3a1d1f] dark:text-[#ffb4b9]"
          >
            {error}
          </div>
        )}

        {/* About you */}
        <section className="grid gap-4">
          <h2 className={sectionTitleClass}>About you</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="su-first" className={labelClass}>First name{requiredMark}</label>
              <input id="su-first" type="text" name="firstName" placeholder="Amina" autoComplete="given-name"
                value={formData.firstName} onChange={handleInputChange} required className={fieldClass} />
            </div>
            <div className="grid gap-2">
              <label htmlFor="su-last" className={labelClass}>Last name{requiredMark}</label>
              <input id="su-last" type="text" name="lastName" placeholder="Bello" autoComplete="family-name"
                value={formData.lastName} onChange={handleInputChange} required className={fieldClass} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="su-staff" className={labelClass}>Staff ID{requiredMark}</label>
              <input id="su-staff" type="number" name="staffId" placeholder="e.g. 1042" inputMode="numeric"
                value={formData.staffId} onChange={handleInputChange} required className={fieldClass} />
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
              value={formData.email} onChange={handleInputChange} required className={fieldClass} />
            <span className="text-[12px] text-[#6b655f] dark:text-[#a39b93]">Must end in @mercycorps.org</span>
          </div>
        </section>

        {/* Where you work */}
        <section className="grid gap-4">
          <h2 className={sectionTitleClass}>Where you work</h2>
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
        </section>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-[#c4232f] px-4 py-3.5 text-[15px] font-semibold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#fbe9ea] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#e0484f] dark:focus-visible:ring-[#3a1d1f]"
        >
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>

        <p className="text-center text-[14px] text-[#6b655f] dark:text-[#a39b93]">
          Already have an account?{" "}
          <a href="/" className="font-semibold text-[#1d1b1a] underline-offset-4 hover:underline dark:text-[#f3efea]">
            Sign in
          </a>
        </p>
      </form>
    </div>
  );
}
