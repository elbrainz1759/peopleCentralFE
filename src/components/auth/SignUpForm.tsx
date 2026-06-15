"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { userService } from "@/services/user.service";
import { toast } from "react-hot-toast";
import CustomSelect from "@/components/form/CustomSelect";
import { Modal } from "@/components/ui/modal";

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

  if (isFetchingData) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500/20 border-t-brand-500 mb-3"></div>
        <p className="text-sm text-gray-500">Loading form data...</p>
      </div>
    );
  }

  return (
    <>
    <Modal isOpen={showEmailModal} onClose={() => setShowEmailModal(false)} className="max-w-sm mx-4 p-6">
      <div className="flex flex-col items-center gap-4 pt-4 pb-2 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
          <svg className="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-white">Invalid Email Address</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Only <span className="font-medium text-brand-600">@mercycorps.org</span> email addresses are allowed.
          </p>
        </div>
        <button
          onClick={() => setShowEmailModal(false)}
          className="w-full rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
        >
          Got it
        </button>
      </div>
    </Modal>
    <div className="p-2">
      <div className="mb-6">
        <h1 className="mb-1 font-bold text-gray-800 text-title-sm dark:text-white/90">
          Create Employee Account
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Register your employee profile to get started.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          {error && (
            <div className="p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
              {error}
            </div>
          )}

          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>First Name <span className="text-error-500">*</span></Label>
              <Input type="text" name="firstName" placeholder="John"
                value={formData.firstName} onChange={handleInputChange} required />
            </div>
            <div>
              <Label>Last Name <span className="text-error-500">*</span></Label>
              <Input type="text" name="lastName" placeholder="Doe"
                value={formData.lastName} onChange={handleInputChange} required />
            </div>
          </div>

          {/* Staff ID */}
          <div>
            <Label>Staff ID <span className="text-error-500">*</span></Label>
            <Input type="number" name="staffId" placeholder="e.g. 1042"
              value={formData.staffId} onChange={handleInputChange} required />
          </div>

          {/* Email */}
          <div>
            <Label>Email Address <span className="text-error-500">*</span></Label>
            <Input type="email" name="email" placeholder="you@mercycorps.org"
              value={formData.email} onChange={handleInputChange} required />
          </div>

          {/* Designation */}
          <div>
            <Label>Designation</Label>
            <Input type="text" name="designation" placeholder="e.g. Software Engineer"
              value={formData.designation} onChange={handleInputChange} />
          </div>

          {/* Country + Department */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Country <span className="text-error-500">*</span></Label>
              <CustomSelect
                value={formData.countryId}
                onChange={(v) => setFormData((prev) => ({ ...prev, countryId: v }))}
                options={countries.map((c: any) => ({ value: c.unique_id, label: c.name }))}
                placeholder="Select Country"
              />
            </div>
            <div>
              <Label>Department <span className="text-error-500">*</span></Label>
              <CustomSelect
                value={formData.departmentId}
                onChange={(v) => setFormData((prev) => ({ ...prev, departmentId: v }))}
                options={departments.map((d: any) => ({ value: d.unique_id, label: d.name }))}
                placeholder="Select Department"
              />
            </div>
          </div>

          {/* Location + Program */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Location <span className="text-error-500">*</span></Label>
              <CustomSelect
                value={formData.locationId}
                onChange={(v) => setFormData((prev) => ({ ...prev, locationId: v }))}
                options={locations.map((l: any) => ({ value: l.unique_id, label: l.name }))}
                placeholder="Select Location"
              />
            </div>
            <div>
              <Label>Program <span className="text-error-500">*</span></Label>
              <CustomSelect
                value={formData.programId}
                onChange={(v) => setFormData((prev) => ({ ...prev, programId: v }))}
                options={programs.map((p: any) => ({ value: p.unique_id, label: p.name }))}
                placeholder="Select Program"
              />
            </div>
          </div>


          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center w-full px-4 py-4 text-sm font-bold text-white transition-all rounded-xl bg-brand-500 shadow-lg shadow-brand-500/25 hover:bg-brand-600 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Creating...</span>
                </div>
              ) : "Create Employee Account"}
            </button>
          </div>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{" "}
          <a href="/" className="font-medium text-brand-500 hover:text-brand-600">Sign in</a>
        </p>
      </div>
    </div>
    </>
  );
}
