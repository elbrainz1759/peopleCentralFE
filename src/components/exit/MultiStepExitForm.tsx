"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { ExitService, ExitInterview } from "@/services/exit.service";
import { leaveServiceInstance } from "@/services/leave.service";
import { authService } from "@/services/auth.service";
import { userService } from "@/services/user.service";
import Button from "@/components/ui/button/Button";
import DatePicker from "@/components/form/date-picker";
import CustomSelect from "@/components/form/CustomSelect";

type FreqRating = "Almost Always" | "Usually" | "Sometimes" | "Never" | "";
type QualRating = "Excellent" | "Good" | "Fair" | "Poor" | "";
type BenefitRating = "Excellent" | "Good" | "Fair" | "Poor" | "No Opinion" | "";
type WorkloadRating = "Too much" | "About right" | "Too little" | "";

interface ExitFormData {
  // Step 1
  departmentId: string;
  programId: string;
  locationId: string;
  countryId: string;
  supervisorId: string;
  resignationDate: string;
  handoverNotes: string;
  reasonForLeaving: string;
  otherReason?: string;
  newEmployer?: string;
  // Step 2 — PDF Q1–Q11
  whyLeaving: string;
  whatWouldPrevent: string;
  likedMost: string;
  likedLeast: string;
  supervisorFair: FreqRating;
  supervisorRecognition: FreqRating;
  supervisorComplaints: FreqRating;
  supervisorSensitive: FreqRating;
  supervisorFeedback: FreqRating;
  supervisorCommunication: FreqRating;
  supervisorPolicies: FreqRating;
  ratingCoopDept: QualRating;
  ratingCoopOther: QualRating;
  ratingTraining: QualRating;
  ratingEquipment: QualRating;
  ratingPerfReview: QualRating;
  ratingOrientation: QualRating;
  ratingPay: QualRating;
  ratingCareerDev: QualRating;
  ratingWorkConditions: QualRating;
  ratingComments: string;
  workAsExpected: "Yes" | "No" | "";
  workExpectedComments: string;
  workload: WorkloadRating;
  benefitHolidays: BenefitRating;
  benefitAnnualLeave: BenefitRating;
  benefitMedical: BenefitRating;
  benefitSickLeave: BenefitRating;
  benefitGratuity: BenefitRating;
  benefitEducation: BenefitRating;
  wouldRecommend: "Yes" | "No" | "Maybe";
  suggestions: string;
}

export default function MultiStepExitForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [supervisorName, setSupervisorName] = useState<string>("");
  const [departments, setDepartments] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState("");

  const emptyForm: ExitFormData = {
    departmentId: "", programId: "", locationId: "", countryId: "",
    supervisorId: "", resignationDate: "", handoverNotes: "",
    reasonForLeaving: "", otherReason: "", newEmployer: "",
    whyLeaving: "", whatWouldPrevent: "", likedMost: "", likedLeast: "",
    supervisorFair: "", supervisorRecognition: "", supervisorComplaints: "",
    supervisorSensitive: "", supervisorFeedback: "", supervisorCommunication: "", supervisorPolicies: "",
    ratingCoopDept: "", ratingCoopOther: "", ratingTraining: "", ratingEquipment: "",
    ratingPerfReview: "", ratingOrientation: "", ratingPay: "", ratingCareerDev: "", ratingWorkConditions: "",
    ratingComments: "", workAsExpected: "", workExpectedComments: "", workload: "",
    benefitHolidays: "", benefitAnnualLeave: "", benefitMedical: "",
    benefitSickLeave: "", benefitGratuity: "", benefitEducation: "",
    wouldRecommend: "Maybe", suggestions: "",
  };
  const [formData, setFormData] = useState<ExitFormData>(emptyForm);

  const exitServiceInstance = ExitService.getInstance();
  const router = useRouter();

  useEffect(() => {
    fetchStaffDetails();
    fetchDepartments();
    fetchPrograms();
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await exitServiceInstance.getLocations();
      setLocations(response.data || response || []);
    } catch (error) {
      console.error("Failed to fetch locations:", error);
    }
  };

  const fetchPrograms = async () => {
    try {
      const response = await exitServiceInstance.getPrograms();
      setPrograms(response.data || response || []);
    } catch (error) {
      console.error("Failed to fetch programs:", error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await exitServiceInstance.getDepartments();
      const depts = response.data || response || [];
      setDepartments(depts);
      if (depts.length > 0) {
        setSelectedDeptId(depts[0].unique_id || depts[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  };

  const fetchStaffDetails = async () => {
    try {
      const authUser = authService.getCurrentUser();
      const rawUserString = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null;
      const rawTokenString = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

      console.log("Debug - MultiStepExitForm authUser:", authUser);
      console.log("Debug - MultiStepExitForm raw localStorage auth_user:", rawUserString);
      console.log("Debug - MultiStepExitForm raw localStorage auth_token:", rawTokenString);

      const authToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      let userId = authUser?.staff_id || authUser?.staffId || authUser?.email || authUser?.unique_id || authUser?.uniqueId || authUser?.id;

      // Log what we found so far
      console.log('Debug - Initial userId search result:', userId);

      // If missing from authUser, check token payload
      if (!userId && authToken) {
        try {
          const payload = JSON.parse(atob(authToken.split('.')[1]));
          console.log('Debug - Token payload:', payload);
          userId = payload.staff_id || payload.staffId || payload.id || payload.sub;
        } catch (e) {
          console.error("Token decode error:", e);
        }
      }

      let response;
      if (userId) {
        console.log('Debug - Fetching details with identity:', userId);
        response = await leaveServiceInstance.getStaffDetails(userId);
      } else {
        console.log('Debug - Identity missing, trying parameterless fetch...');
        response = await leaveServiceInstance.getStaffDetails();
      }

      // The API returns an array of balance objects, take the first one for staff info
      const rawData = response.data || response;
      const staffData = Array.isArray(rawData) ? rawData[0] : rawData;
      console.log('Debug - Extracted staffData:', staffData);

      // Update currentUser AND try to update auth_user in localStorage if it was null
      setCurrentUser(staffData);
      if (staffData) {
        let resolvedSupervisorName = staffData.supervisor_name ||
          `${staffData.supervisor_first_name || ""} ${staffData.supervisor_last_name || ""}`.trim() ||
          "";

        if (!resolvedSupervisorName && staffData.supervisor) {
          try {
            const empsRes = await userService.getAllEmployees();
            const employees = empsRes.data || [];
            const supervisor = employees.find(
              (e: any) => e.unique_id === staffData.supervisor || String(e.id) === String(staffData.supervisor)
            );
            if (supervisor) {
              resolvedSupervisorName = `${supervisor.first_name || ""} ${supervisor.last_name || ""}`.trim();
            }
          } catch {
            // silently fall back to showing the ID
          }
        }

        setSupervisorName(resolvedSupervisorName);
        setFormData(prev => ({
          ...prev,
          departmentId: staffData.department || "",
          programId: staffData.program || "",
          locationId: staffData.location || "",
          countryId: staffData.country || "",
          supervisorId: staffData.supervisor || "",
        }));
      }
      if (!authUser && staffData) {
        localStorage.setItem('auth_user', JSON.stringify(staffData));
      }
    } catch (error) {
      console.error("Failed to fetch staff details:", error);
      // Fallback for demo or if endpoint fails
      const userData = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null;
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setCurrentUser(user);
        } catch (e) {
          console.error("Failed to parse user data:", e);
        }
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const { name, value } = target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateLastWorkingDay = (resignationDate: string) => {
    if (!resignationDate) return "N/A";
    const date = new Date(resignationDate);
    date.setMonth(date.getMonth() + 1); // Add 1 month
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const exitInterviewData: any = {
        staffId: Number(currentUser?.staff_id || currentUser?.id || 0),
        supervisorId: formData.supervisorId || currentUser?.supervisor,
        departmentId: formData.departmentId,
        programId: formData.programId,
        locationId: formData.locationId,
        countryId: formData.countryId,
        resignationDate: formData.resignationDate,
        handoverNotes: formData.handoverNotes || "N/A",
        reasonForLeaving: formData.reasonForLeaving,
        otherReason: formData.otherReason || "N/A",
        newEmployer: formData.newEmployer || "N/A",
        // Q1–Q4
        whyLeaving: formData.whyLeaving,
        whatWouldPrevent: formData.whatWouldPrevent,
        mostEnjoyed: formData.likedMost || "N/A",
        companyImprovement: formData.likedLeast || "N/A",
        // Q5 — supervisor
        supervisorFair: formData.supervisorFair,
        supervisorRecognition: formData.supervisorRecognition,
        supervisorComplaints: formData.supervisorComplaints,
        supervisorSensitive: formData.supervisorSensitive,
        supervisorFeedback: formData.supervisorFeedback,
        supervisorCommunication: formData.supervisorCommunication,
        supervisorPolicies: formData.supervisorPolicies,
        // Q6 — org ratings
        ratingCoopDept: formData.ratingCoopDept,
        ratingCoopOther: formData.ratingCoopOther,
        ratingTraining: formData.ratingTraining,
        ratingEquipment: formData.ratingEquipment,
        ratingPerfReview: formData.ratingPerfReview,
        ratingOrientation: formData.ratingOrientation,
        ratingPay: formData.ratingPay,
        ratingCareerDev: formData.ratingCareerDev,
        ratingWorkConditions: formData.ratingWorkConditions,
        ratingComments: formData.ratingComments,
        // Q7
        workAsExpected: formData.workAsExpected,
        workExpectedComments: formData.workExpectedComments,
        // Q8
        workload: formData.workload,
        // Q9 — benefits
        benefitHolidays: formData.benefitHolidays,
        benefitAnnualLeave: formData.benefitAnnualLeave,
        benefitMedical: formData.benefitMedical,
        benefitSickLeave: formData.benefitSickLeave,
        benefitGratuity: formData.benefitGratuity,
        benefitEducation: formData.benefitEducation,
        // Q10–Q11
        wouldRecommend: formData.wouldRecommend,
        suggestions: formData.suggestions,
        status: 'Pending',
        stage: 'Employee',
      };

      await exitServiceInstance.createExitInterview(exitInterviewData);
      toast.success("Exit interview submitted successfully!");
      router.push("/exit/approvals");

      setFormData(emptyForm);
      setCurrentStep(1);

    } catch (error: any) {
      console.error("Failed to submit exit interview:", error);
      toast.error(error.response?.data?.message || "Failed to submit exit interview");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateMMDDYY = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split('-');
    return `${month}/${day}/${year.slice(-2)}`;
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };



  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              Exit Interview
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-base">
              Securely process your formal separation through our guided workflow.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-2xl border border-gray-100 dark:border-gray-800">
            {[1, 2].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-xl font-bold text-base transition-all duration-500 ${step === currentStep
                    ? 'bg-brand-500 text-white shadow-xl shadow-brand-500/30 scale-110 ring-4 ring-brand-500/10'
                    : step < currentStep
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                      : 'bg-white dark:bg-gray-800 text-gray-400 border border-gray-100 dark:border-gray-700'
                    }`}
                >
                  {step < currentStep ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : step}
                </div>
                {step < 2 && (
                  <div className={`w-6 h-1 mx-1 rounded-full ${step < currentStep ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-800'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute -inset-4 bg-gradient-to-tr from-brand-500/5 to-transparent rounded-[3rem] blur-3xl -z-10" />

        {/* Step 1: Personnel Details */}
        {currentStep === 1 && (
          <div className="mb-6 bg-white/80 dark:bg-gray-900/60 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/40 p-10 dark:border-gray-800 backdrop-blur-2xl transition-all duration-700 animate-in fade-in slide-in-from-bottom-8">
            <div className="">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Step 1: Background & Logistics</h2>
                <span className="text-[10px] font-black text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-3 py-1.5 rounded-full uppercase tracking-widest border border-brand-100 dark:border-brand-500/20">Read-Only Profile</span>
              </div>

              <div className="bg-gray-50/50 dark:bg-gray-800/20 rounded-[2rem] border border-gray-100 dark:border-gray-800 p-10 mb-12 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full -mr-32 -mt-32 blur-[100px] transition-all duration-1000 group-hover:bg-brand-500/10" />

                <h3 className="text-[11px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-[0.3em] mb-12 flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_15px_rgba(var(--color-brand-500),0.8)] animate-pulse"></span>
                  Verified Personnel Identity
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-16 relative">
                  {[
                    { label: "Legal Name", value: currentUser ? `${currentUser.first_name || currentUser.firstName || ""} ${currentUser.last_name || currentUser.lastName || ""}`.trim() || currentUser.name || "Unknown User" : "Loading...", highlight: true },
                    { label: "Staff ID", value: `#${currentUser?.staff_id || currentUser?.id || "N/A"}`, muted: true },
                    { label: "Designation", value: currentUser?.designation || currentUser?.role || "N/A" },
                    { label: "Department", value: currentUser?.department_name || currentUser?.department?.name || currentUser?.department || "N/A" },
                    { label: "Primary Location", value: currentUser?.location_name || currentUser?.location?.name || currentUser?.location || "N/A" },
                    { label: "Active Program", value: currentUser?.program_name || currentUser?.program?.name || currentUser?.program || "N/A" },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-2.5">
                      <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] block">{item.label}</span>
                      <p className={`text-lg font-bold ${item.highlight ? "text-gray-900 dark:text-white" : item.muted ? "text-gray-600 dark:text-gray-400" : "text-gray-900 dark:text-white"}`}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
                <div className="space-y-3.5">
                  <label className="text-sm font-black text-gray-800 dark:text-gray-200 ml-1 tracking-tight">
                    Supervisor Name / ID *
                  </label>
                  <div className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50/50 dark:bg-gray-800/20 dark:border-gray-800 px-6 py-5 font-bold text-gray-900 dark:text-white shadow-sm min-h-16 flex items-center">
                    {supervisorName
                      ? supervisorName
                      : <span className="text-gray-400 font-normal">Not assigned</span>
                    }
                  </div>
                </div>

                <div className="space-y-3.5">
                  <label className="text-sm font-black text-gray-800 dark:text-gray-200 ml-1 tracking-tight">
                    Resignation Date * <span className="text-xs font-normal text-gray-400">(MM/DD/YY)</span>
                  </label>
                  <DatePicker
                    id="resignationDate"
                    value={formData.resignationDate}
                    onChange={(_, dateStr) => setFormData(prev => ({ ...prev, resignationDate: dateStr }))}
                    placeholder="YYYY-MM-DD"
                  />
                  {formData.resignationDate && (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2.5 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 w-fit">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Selected:</span>
                        <span className="text-sm font-black text-gray-800 dark:text-white">{formatDateMMDDYY(formData.resignationDate)}</span>
                      </div>
                      <div className="flex items-center gap-2.5 px-4 py-2 bg-brand-50 dark:bg-brand-500/5 rounded-xl border border-brand-100 dark:border-brand-500/20 w-fit">
                        <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                        <p className="text-[11px] font-black text-brand-700 dark:text-brand-400 uppercase tracking-widest">
                          Commitment End: <span className="opacity-70 font-bold">{formatDateMMDDYY(calculateLastWorkingDay(formData.resignationDate))}</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3.5">
                  <label className="text-sm font-black text-gray-800 dark:text-gray-200 ml-1 tracking-tight">
                    Primary Reason for Leaving *
                  </label>
                  <CustomSelect
                    value={formData.reasonForLeaving}
                    onChange={(v) => setFormData(prev => ({ ...prev, reasonForLeaving: v }))}
                    options={[
                      { value: "Better Opportunity", label: "Better Opportunity" },
                      { value: "Career Change", label: "Career Change" },
                      { value: "Further Education", label: "Further Education" },
                      { value: "Personal Reasons", label: "Personal Reasons" },
                      { value: "Retirement", label: "Retirement" },
                      { value: "Other", label: "Other" },
                    ]}
                    placeholder="Select a reason"
                  />
                </div>
              </div>

              <div className="space-y-12">
                {formData.reasonForLeaving === 'Other' && (
                  <div className="space-y-3.5 animate-in fade-in slide-in-from-top-4 duration-500">
                    <label className="text-sm font-black text-gray-800 dark:text-gray-200 ml-1">
                      Extended Reason Details
                    </label>
                    <input
                      type="text"
                      name="otherReason"
                      value={formData.otherReason}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl border-2 border-gray-100 bg-white dark:bg-gray-950 px-6 py-5 text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 dark:border-gray-800 transition-all font-bold shadow-sm"
                      placeholder="Please elaborate further..."
                    />
                  </div>
                )}

                <div className="space-y-3.5">
                  <label className="text-sm font-black text-gray-800 dark:text-gray-200 ml-1">
                    Future Employment (Optional)
                  </label>
                  <input
                    type="text"
                    name="newEmployer"
                    value={formData.newEmployer}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border-2 border-gray-100 bg-white dark:bg-gray-950 px-6 py-5 text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 dark:border-gray-800 transition-all font-bold shadow-sm"
                    placeholder="New organization or career path..."
                  />
                </div>

                <div className="space-y-3.5">
                  <label className="text-sm font-black text-gray-800 dark:text-gray-200 ml-1">
                    Formal Handover Brief
                  </label>
                  <textarea
                    name="handoverNotes"
                    value={formData.handoverNotes}
                    onChange={handleInputChange}
                    rows={8}
                    className="w-full rounded-[2rem] border-2 border-gray-100 bg-white dark:bg-gray-950 px-8 py-6 text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 dark:border-gray-800 transition-all font-bold resize-none shadow-sm"
                    placeholder="Provide a high-level summary of outstanding tasks, key internal contacts, and documentation locations..."
                  />
                </div>
              </div>

              <div className="flex justify-end mt-16 border-t border-gray-50 dark:border-gray-800 pt-10">
                <Button onClick={nextStep} className="px-14 py-6 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-black shadow-2xl shadow-brand-500/30 transition-all hover:scale-[1.03] hover:-translate-y-1.5 active:scale-95 group flex items-center gap-4 text-lg">
                  Proceed to Assessment
                  <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Exit Interview Questions (Q1–Q11) */}
        {currentStep === 2 && (
          <div className="mb-6 bg-white/80 dark:bg-gray-900/60 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/40 p-10 dark:border-gray-800 backdrop-blur-2xl transition-all duration-700 animate-in fade-in slide-in-from-right-8 space-y-10">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Step 2: Exit Interview</h2>

            {/* Q1 */}
            <div className="space-y-3">
              <label className="text-base font-black text-gray-900 dark:text-white">1. Why are you leaving Mercy Corps?</label>
              <textarea name="whyLeaving" value={formData.whyLeaving} onChange={handleInputChange} rows={3} required
                className="w-full rounded-2xl border-2 border-gray-100 bg-white dark:bg-gray-950 px-6 py-4 text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 dark:border-gray-800 transition-all resize-none" placeholder="Please explain..." />
            </div>

            {/* Q2 */}
            <div className="space-y-3">
              <label className="text-base font-black text-gray-900 dark:text-white">2. What circumstances would have prevented your departure?</label>
              <textarea name="whatWouldPrevent" value={formData.whatWouldPrevent} onChange={handleInputChange} rows={3}
                className="w-full rounded-2xl border-2 border-gray-100 bg-white dark:bg-gray-950 px-6 py-4 text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 dark:border-gray-800 transition-all resize-none" placeholder="Please explain..." />
            </div>

            {/* Q3 */}
            <div className="space-y-3">
              <label className="text-base font-black text-gray-900 dark:text-white">3. What did you like most about your job?</label>
              <textarea name="likedMost" value={formData.likedMost} onChange={handleInputChange} rows={3}
                className="w-full rounded-2xl border-2 border-gray-100 bg-white dark:bg-gray-950 px-6 py-4 text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 dark:border-gray-800 transition-all resize-none" placeholder="Please explain..." />
            </div>

            {/* Q4 */}
            <div className="space-y-3">
              <label className="text-base font-black text-gray-900 dark:text-white">4. What did you like least about your job?</label>
              <textarea name="likedLeast" value={formData.likedLeast} onChange={handleInputChange} rows={3}
                className="w-full rounded-2xl border-2 border-gray-100 bg-white dark:bg-gray-950 px-6 py-4 text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 dark:border-gray-800 transition-all resize-none" placeholder="Please explain..." />
            </div>

            {/* Q5 — Supervisor */}
            <div className="space-y-4">
              <label className="text-base font-black text-gray-900 dark:text-white">5. What did you think of your supervisor on the following points:</label>
              <div className="overflow-x-auto rounded-2xl border-2 border-gray-100 dark:border-gray-800">
                <table className="w-full min-w-[520px]">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest"></th>
                      {(["Almost Always", "Usually", "Sometimes", "Never"] as FreqRating[]).map(h => (
                        <th key={h} className="px-3 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 text-center whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {([
                      ["Was consistently fair", "supervisorFair"],
                      ["Provided recognition", "supervisorRecognition"],
                      ["Resolved complaints", "supervisorComplaints"],
                      ["Was sensitive to employees' needs", "supervisorSensitive"],
                      ["Provided feedback on performance", "supervisorFeedback"],
                      ["Was receptive to open communication", "supervisorCommunication"],
                      ["Followed Mercy Corps' policies", "supervisorPolicies"],
                    ] as [string, keyof ExitFormData][]).map(([label, field]) => (
                      <tr key={field}>
                        <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{label}</td>
                        {(["Almost Always", "Usually", "Sometimes", "Never"] as FreqRating[]).map(opt => (
                          <td key={opt} className="py-3 text-center">
                            <input type="radio" name={field} value={opt} checked={formData[field] === opt}
                              onChange={() => setFormData(p => ({ ...p, [field]: opt }))} className="accent-brand-500" />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Q6 — Org ratings */}
            <div className="space-y-4">
              <label className="text-base font-black text-gray-900 dark:text-white">6. How would you rate the following:</label>
              <div className="overflow-x-auto rounded-2xl border-2 border-gray-100 dark:border-gray-800">
                <table className="w-full min-w-[520px]">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest"></th>
                      {(["Excellent", "Good", "Fair", "Poor"] as QualRating[]).map(h => (
                        <th key={h} className="px-3 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 text-center">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {([
                      ["Cooperation within your department/program", "ratingCoopDept"],
                      ["Cooperation with other departments", "ratingCoopOther"],
                      ["Personal job training", "ratingTraining"],
                      ["Equipment provided (materials, resources, facilities)", "ratingEquipment"],
                      ["Organisation's performance review system", "ratingPerfReview"],
                      ["Organisation's new employee orientation program", "ratingOrientation"],
                      ["Rate of pay for your job", "ratingPay"],
                      ["Career development/Advancement opportunities", "ratingCareerDev"],
                      ["Physical working conditions", "ratingWorkConditions"],
                    ] as [string, keyof ExitFormData][]).map(([label, field]) => (
                      <tr key={field}>
                        <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{label}</td>
                        {(["Excellent", "Good", "Fair", "Poor"] as QualRating[]).map(opt => (
                          <td key={opt} className="py-3 text-center">
                            <input type="radio" name={field} value={opt} checked={formData[field] === opt}
                              onChange={() => setFormData(p => ({ ...p, [field]: opt }))} className="accent-brand-500" />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Comments:</label>
                <textarea name="ratingComments" value={formData.ratingComments} onChange={handleInputChange} rows={2}
                  className="w-full rounded-2xl border-2 border-gray-100 bg-white dark:bg-gray-950 px-6 py-4 text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 dark:border-gray-800 transition-all resize-none" />
              </div>
            </div>

            {/* Q7 */}
            <div className="space-y-3">
              <label className="text-base font-black text-gray-900 dark:text-white">7. Was the work you were doing approximately what you expected it would be?</label>
              <div className="flex gap-6">
                {(["Yes", "No"] as const).map(v => (
                  <label key={v} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="workAsExpected" value={v} checked={formData.workAsExpected === v}
                      onChange={() => setFormData(p => ({ ...p, workAsExpected: v }))} className="accent-brand-500 w-4 h-4" />
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{v}</span>
                  </label>
                ))}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Comments:</label>
                <textarea name="workExpectedComments" value={formData.workExpectedComments} onChange={handleInputChange} rows={2}
                  className="w-full rounded-2xl border-2 border-gray-100 bg-white dark:bg-gray-950 px-6 py-4 text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 dark:border-gray-800 transition-all resize-none" />
              </div>
            </div>

            {/* Q8 */}
            <div className="space-y-3">
              <label className="text-base font-black text-gray-900 dark:text-white">8. Was your workload usually:</label>
              <div className="flex flex-wrap gap-6">
                {(["Too much", "About right", "Too little"] as WorkloadRating[]).map(v => (
                  <label key={v} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="workload" value={v} checked={formData.workload === v}
                      onChange={() => setFormData(p => ({ ...p, workload: v }))} className="accent-brand-500 w-4 h-4" />
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{v}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Q9 — Benefits */}
            <div className="space-y-4">
              <label className="text-base font-black text-gray-900 dark:text-white">9. How did you feel about the employee benefits provided by the company?</label>
              <div className="overflow-x-auto rounded-2xl border-2 border-gray-100 dark:border-gray-800">
                <table className="w-full min-w-[560px]">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest"></th>
                      {(["Excellent", "Good", "Fair", "Poor", "No Opinion"] as BenefitRating[]).map(h => (
                        <th key={h} className="px-3 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 text-center whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {([
                      ["Paid holidays", "benefitHolidays"],
                      ["Paid Annual Leave", "benefitAnnualLeave"],
                      ["Medical plan", "benefitMedical"],
                      ["Sick leave", "benefitSickLeave"],
                      ["Gratuity/Severance", "benefitGratuity"],
                      ["Educational assistance", "benefitEducation"],
                    ] as [string, keyof ExitFormData][]).map(([label, field]) => (
                      <tr key={field}>
                        <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{label}</td>
                        {(["Excellent", "Good", "Fair", "Poor", "No Opinion"] as BenefitRating[]).map(opt => (
                          <td key={opt} className="py-3 text-center">
                            <input type="radio" name={field} value={opt} checked={formData[field] === opt}
                              onChange={() => setFormData(p => ({ ...p, [field]: opt }))} className="accent-brand-500" />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Q10 */}
            <div className="space-y-3">
              <label className="text-base font-black text-gray-900 dark:text-white">10. Would you recommend MC to a friend as a good organisation to work for?</label>
              <div className="flex flex-wrap gap-4">
                {(["Yes", "No", "Maybe"] as const).map(opt => (
                  <button key={opt} type="button" onClick={() => setFormData(p => ({ ...p, wouldRecommend: opt }))}
                    className={`px-8 py-4 rounded-2xl border-2 transition-all font-black ${formData.wouldRecommend === opt
                      ? 'bg-brand-500 border-brand-500 text-white shadow-xl shadow-brand-500/30'
                      : 'bg-white dark:bg-gray-950 border-gray-100 dark:border-gray-800 text-gray-400 hover:border-brand-300'}`}>
                    {opt === "Yes" ? "Most definitely" : opt === "Maybe" ? "With reservations" : "No"}
                  </button>
                ))}
              </div>
            </div>

            {/* Q11 */}
            <div className="space-y-3">
              <label className="text-base font-black text-gray-900 dark:text-white">11. What suggestions do you have to make Mercy Corps a better place to work?</label>
              <textarea name="suggestions" value={formData.suggestions} onChange={handleInputChange} rows={4}
                className="w-full rounded-2xl border-2 border-gray-100 bg-white dark:bg-gray-950 px-6 py-4 text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 dark:border-gray-800 transition-all resize-none" placeholder="Your suggestions..." />
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-800">
              <Button onClick={prevStep} variant="outline" className="px-10 py-5 rounded-2xl font-bold border-2 border-gray-100 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all">
                Back
              </Button>
              <div className="group relative">
                <div className="absolute -inset-1 bg-brand-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                <Button onClick={handleSubmit} disabled={isSubmitting}
                  className="relative px-14 py-6 rounded-2xl bg-gray-900 dark:bg-brand-500 hover:scale-[1.03] text-white font-black shadow-2xl transition-all active:scale-95 group flex items-center gap-4 text-lg">
                  {isSubmitting ? "Submitting..." : "Submit Exit Interview"}
                  {!isSubmitting && (
                    <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}


      </div>
    </div>
  );
}
