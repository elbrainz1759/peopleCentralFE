"use client";
import React, { useState, useEffect } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { userService } from "@/services/user.service";
import { toast } from "react-hot-toast";

const selectClass =
  "w-full h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-700 transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300";

export default function SignUpForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    status: "Active",
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

    try {
      await userService.createEmployee({
        firstName: formData.firstName,
        lastName: formData.lastName,
        staffId: parseInt(formData.staffId, 10),
        email: formData.email,
        status: formData.status,
        designation: formData.designation,
        locationId: formData.locationId,
        programId: formData.programId,
        departmentId: formData.departmentId,
        countryId: formData.countryId,
      });

      toast.success("Employee account created successfully!");
      if (onSuccess) onSuccess();
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

          {/* Staff ID + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Staff ID <span className="text-error-500">*</span></Label>
              <Input type="number" name="staffId" placeholder="e.g. 1042"
                value={formData.staffId} onChange={handleInputChange} required />
            </div>
            <div>
              <Label>Status <span className="text-error-500">*</span></Label>
              <select name="status" value={formData.status} onChange={handleInputChange} className={selectClass} required>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Email */}
          <div>
            <Label>Email Address <span className="text-error-500">*</span></Label>
            <Input type="email" name="email" placeholder="you@company.com"
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
              <select name="countryId" value={formData.countryId} onChange={handleInputChange} className={selectClass} required>
                <option value="">Select Country</option>
                {countries.map((c: any) => (
                  <option key={c.unique_id || c.id} value={c.unique_id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Department <span className="text-error-500">*</span></Label>
              <select name="departmentId" value={formData.departmentId} onChange={handleInputChange} className={selectClass} required>
                <option value="">Select Department</option>
                {departments.map((d: any) => (
                  <option key={d.unique_id || d.id} value={d.unique_id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location + Program */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Location <span className="text-error-500">*</span></Label>
              <select name="locationId" value={formData.locationId} onChange={handleInputChange} className={selectClass} required>
                <option value="">Select Location</option>
                {locations.map((l: any) => (
                  <option key={l.unique_id || l.id} value={l.unique_id}>{l.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Program <span className="text-error-500">*</span></Label>
              <select name="programId" value={formData.programId} onChange={handleInputChange} className={selectClass} required>
                <option value="">Select Program</option>
                {programs.map((p: any) => (
                  <option key={p.unique_id || p.id} value={p.unique_id}>{p.name}</option>
                ))}
              </select>
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
  );
}
