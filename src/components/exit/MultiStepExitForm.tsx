"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { ExitService, ChecklistItem, ExitInterview } from "@/services/exit.service";
import { leaveServiceInstance } from "@/services/leave.service";
import { authService } from "@/services/auth.service";
import Button from "@/components/ui/button/Button";

interface ExitFormData {
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
  ratingJob: number;
  ratingManager: number;
  ratingCulture: number;
  mostEnjoyed?: string;
  companyImprovement?: string;
  wouldRecommend: 'Yes' | 'No' | 'Maybe';
  additionalComments?: string;
  selectedChecklistItems: string[];
}

export default function MultiStepExitForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [isLoadingChecklist, setIsLoadingChecklist] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState("");

  const [formData, setFormData] = useState<ExitFormData>({
    departmentId: "",
    programId: "",
    locationId: "",
    countryId: "",
    supervisorId: "",
    resignationDate: "",
    handoverNotes: "",
    reasonForLeaving: "",
    otherReason: "",
    newEmployer: "",
    ratingJob: 3,
    ratingManager: 3,
    ratingCulture: 3,
    mostEnjoyed: "",
    companyImprovement: "",
    wouldRecommend: "Maybe",
    additionalComments: "",
    selectedChecklistItems: [],
  });

  const exitServiceInstance = ExitService.getInstance();

  useEffect(() => {
    fetchChecklistItems();
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

  const fetchChecklistItems = async () => {
    setIsLoadingChecklist(true);
    try {
      const response = await exitServiceInstance.getAllChecklistItems();
      const itemsData = response.data || response || [];
      setChecklistItems(Array.isArray(itemsData) ? itemsData : []);
    } catch (error) {
      console.error("Failed to fetch checklist items:", error);
      toast.error("Could not load checklist items");
    } finally {
      setIsLoadingChecklist(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const { name, value } = target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedChecklistItems: prev.selectedChecklistItems.includes(itemId)
        ? prev.selectedChecklistItems.filter(id => id !== itemId)
        : [...prev.selectedChecklistItems, itemId]
    }));
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
      const getNumericId = (val: any) => {
        const n = parseInt(String(val), 10);
        return isNaN(n) ? val : n;
      };

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
        ratingJob: Number(formData.ratingJob),
        ratingManager: Number(formData.ratingManager),
        ratingCulture: Number(formData.ratingCulture),
        mostEnjoyed: formData.mostEnjoyed || "N/A",
        companyImprovement: formData.companyImprovement || "N/A",
        wouldRecommend: formData.wouldRecommend,
        status: 'Pending',
        stage: 'Supervisor',
      };

      await exitServiceInstance.createExitInterview(exitInterviewData);
      toast.success("Exit interview submitted successfully!");

      // Reset form
      setFormData({
        resignationDate: "",
        handoverNotes: "",
        reasonForLeaving: "",
        otherReason: "",
        newEmployer: "",
        ratingJob: 3,
        ratingManager: 3,
        ratingCulture: 3,
        mostEnjoyed: "",
        companyImprovement: "",
        wouldRecommend: "Maybe",
        additionalComments: "",
        selectedChecklistItems: [],
        departmentId: "",
        programId: "",
        locationId: "",
        countryId: "",
        supervisorId: "",
      });
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



  const groupedChecklistItems = checklistItems.reduce((acc, item) => {
    const deptName = item.departmentName || 'Unknown';
    if (!acc[deptName]) {
      acc[deptName] = [];
    }
    acc[deptName].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

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
            {[1, 2, 3].map((step) => (
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
                {step < 3 && (
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
                  <input
                    type="text"
                    name="supervisorId"
                    value={formData.supervisorId}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border-2 border-gray-100 bg-white dark:bg-gray-950 px-6 py-5 text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 dark:border-gray-800 transition-all font-bold shadow-sm"
                    placeholder="Enter supervisor name or ID..."
                    required
                  />
                </div>

                <div className="space-y-3.5">
                  <label className="text-sm font-black text-gray-800 dark:text-gray-200 ml-1 tracking-tight">
                    Resignation Date * <span className="text-xs font-normal text-gray-400">(MM/DD/YY)</span>
                  </label>
                  <input
                    type="date"
                    name="resignationDate"
                    value={formData.resignationDate}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border-2 border-gray-100 bg-white dark:bg-gray-950 px-6 py-5 text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 dark:border-gray-800 transition-all font-bold shadow-sm"
                    required
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
                  <div className="relative">
                    <select
                      name="reasonForLeaving"
                      value={formData.reasonForLeaving}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl border-2 border-gray-100 bg-white dark:bg-gray-950 px-6 py-5 text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 dark:border-gray-800 transition-all font-bold appearance-none shadow-sm"
                      required
                    >
                      <option value="">Select a reason</option>
                      <option value="Better Opportunity">Better Opportunity</option>
                      <option value="Career Change">Career Change</option>
                      <option value="Further Education">Further Education</option>
                      <option value="Personal Reasons">Personal Reasons</option>
                      <option value="Retirement">Retirement</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-6 pointer-events-none text-gray-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
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

        {/* Step 2: Exit Checklist */}
        {currentStep === 2 && (
          <div className="mb-6 bg-white/80 dark:bg-gray-900/60 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/40 p-10 dark:border-gray-800 backdrop-blur-2xl transition-all duration-700 animate-in fade-in slide-in-from-bottom-8">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Step 2: Exit Checklist</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-10 text-sm">Confirm all items below have been addressed before proceeding.</p>

            {isLoadingChecklist ? (
              <div className="flex items-center justify-center py-16 text-gray-400 text-sm font-medium">Loading checklist items...</div>
            ) : checklistItems.length === 0 ? (
              <div className="flex items-center justify-center py-16 text-gray-400 text-sm font-medium">No checklist items found. Contact HR to configure exit checklist items.</div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedChecklistItems).map(([deptName, items]) => (
                  <div key={deptName} className="rounded-2xl border-2 border-gray-100 dark:border-gray-800 overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                      <h3 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{deptName}</h3>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                      {items.map((item) => (
                        <label key={item.id} className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                          <input
                            type="checkbox"
                            checked={formData.selectedChecklistItems.includes(String(item.id))}
                            onChange={() => handleCheckboxChange(String(item.id))}
                            className="w-5 h-5 rounded-lg border-2 border-gray-300 dark:border-gray-600 accent-brand-500 cursor-pointer"
                          />
                          <span className="text-sm font-semibold text-gray-800 dark:text-white">{item.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-16 border-t border-gray-50 dark:border-gray-800 pt-10">
              <Button onClick={prevStep} variant="outline" className="px-10 py-5 rounded-2xl font-bold border-2 border-gray-100 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all">
                Back
              </Button>
              <Button onClick={nextStep} className="px-14 py-6 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-black shadow-2xl shadow-brand-500/30 transition-all hover:scale-[1.03] hover:-translate-y-1.5 active:scale-95 group flex items-center gap-4 text-lg">
                Proceed to Assessment
                <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Experience Assessment */}
        {currentStep === 3 && (
          <div className="mb-6 bg-white/80 dark:bg-gray-900/60 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/40 p-10 dark:border-gray-800 backdrop-blur-2xl transition-all duration-700 animate-in fade-in slide-in-from-right-8">
            <div className="">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-10 tracking-tight">Step 2: Career Experience Audit</h2>

              <div className="space-y-10">
                {[
                  { name: "ratingJob", label: "Job Satisfaction & Role Impact", desc: "How would you rate the significance and fulfillment of your role?" },
                  { name: "ratingManager", label: "Leadership & Mentorship Quality", desc: "How effective was your direct supervisor in supporting your growth?" },
                  { name: "ratingCulture", label: "Organizational Environment", desc: "How would you rate Mercy Corps' internal culture and values?" },
                ].map((rating, idx) => (
                  <div key={idx} className="space-y-4">
                    <div>
                      <label className="text-base font-black text-gray-900 dark:text-white tracking-tight block">{rating.label}</label>
                      <p className="text-sm text-gray-500 mb-4">{rating.desc}</p>
                    </div>
                    <div className="grid grid-cols-5 gap-4">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, [rating.name]: val }))}
                          className={`py-4 rounded-2xl border-2 transition-all font-black text-lg ${formData[rating.name as keyof ExitFormData] === val
                            ? 'bg-brand-500 border-brand-500 text-white shadow-xl shadow-brand-500/30'
                            : 'bg-white dark:bg-gray-950 border-gray-100 dark:border-gray-800 text-gray-400 hover:border-brand-200 dark:hover:border-brand-900'
                            }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="space-y-4">
                  <label className="text-base font-black text-gray-900 dark:text-white tracking-tight">Highlight of Tenure</label>
                  <textarea
                    name="mostEnjoyed"
                    value={formData.mostEnjoyed}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full rounded-2xl border-2 border-gray-100 bg-white dark:bg-gray-950 px-6 py-5 text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 dark:border-gray-800 transition-all font-bold resize-none"
                    placeholder="Key successes or aspects you found most rewarding..."
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-base font-black text-gray-900 dark:text-white tracking-tight">Strategic Improvements</label>
                  <textarea
                    name="companyImprovement"
                    value={formData.companyImprovement}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full rounded-2xl border-2 border-gray-100 bg-white dark:bg-gray-950 px-6 py-5 text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 dark:border-gray-800 transition-all font-bold resize-none"
                    placeholder="How can we better support our team members?"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-base font-black text-gray-900 dark:text-white tracking-tight">Referral Likelihood</label>
                  <div className="flex gap-4">
                    {['Yes', 'No', 'Maybe'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, wouldRecommend: opt as any }))}
                        className={`flex-1 py-5 rounded-2xl border-2 transition-all font-black ${formData.wouldRecommend === opt
                          ? 'bg-brand-500 border-brand-500 text-white shadow-xl shadow-brand-500/30'
                          : 'bg-white dark:bg-gray-950 border-gray-100 dark:border-gray-800 text-gray-400 hover:border-brand-200 dark:hover:border-brand-900'
                          }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-16 border-t border-gray-50 dark:border-gray-800 pt-10">
                <Button onClick={prevStep} variant="outline" className="px-10 py-5 rounded-2xl font-bold border-2 border-gray-100 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all">
                  Back
                </Button>
                <div className="group relative">
                  <div className="absolute -inset-1 bg-brand-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="relative px-14 py-6 rounded-2xl bg-gray-900 dark:bg-brand-500 hover:scale-[1.03] text-white font-black shadow-2xl transition-all active:scale-95 group flex items-center gap-4 text-lg"
                  >
                    {isSubmitting ? "Finalizing Submission..." : "Complete Exit Process"}
                    {!isSubmitting && (
                      <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}


      </div>
    </div>
  );
}
