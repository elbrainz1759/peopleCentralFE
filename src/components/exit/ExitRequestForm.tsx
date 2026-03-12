"use client";
import React, { useState, useEffect } from "react";
import { ExitService, ChecklistItem, ExitInterview } from "@/services/exit.service";
import { authService } from "@/services/auth.service";
import { leaveServiceInstance } from "@/services/leave.service";
import { toast } from "react-hot-toast";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/light.css";
import { DownloadIcon, PlusIcon, TrashBinIcon } from "@/icons";
import DatePicker from "@/components/form/date-picker";

export default function ExitRequestForm({ onClose, initialData }: { onClose: () => void, initialData?: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [isLoadingChecklist, setIsLoadingChecklist] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
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
    ratingJob: "3",
    ratingManager: "3",
    ratingCulture: "3",
    mostEnjoyed: "",
    companyImprovement: "",
    wouldRecommend: "Yes",
    additionalComments: "",
    signature: false,
    selectedChecklistItems: [] as string[],
  });

  const exitServiceInstance = ExitService.getInstance();

  // Load data
  // Load data
  const loadUserData = React.useCallback(async () => {
    setIsLoadingUser(true);
    try {
      const authUser = authService.getCurrentUser();
      const authToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      let userId = authUser?.staff_id || authUser?.staffId || authUser?.email || authUser?.unique_id || authUser?.uniqueId || authUser?.id;

      if (!userId && authToken) {
        try {
          const payload = JSON.parse(atob(authToken.split('.')[1]));
          userId = payload.staff_id || payload.staffId || payload.id || payload.sub;
        } catch (e) {
          console.error("Token decode error:", e);
        }
      }

      let response;
      if (userId) {
        response = await leaveServiceInstance.getStaffDetails(userId);
      } else {
        response = await leaveServiceInstance.getStaffDetails();
      }

      const rawData = response.data || response;
      const staffData = Array.isArray(rawData) ? rawData[0] : rawData;

      if (staffData) {
        setCurrentUser(staffData);
        setFormData(prev => ({
          ...prev,
          departmentId: staffData.department || "",
          programId: staffData.program || "",
          locationId: staffData.location || "",
          countryId: staffData.country || "",
          supervisorId: staffData.supervisor || "",
        }));
        if (!authUser && typeof window !== 'undefined') {
          localStorage.setItem('auth_user', JSON.stringify(staffData));
        }
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    } finally {
      setIsLoadingUser(false);
    }
  }, []);

  const fetchChecklistItems = React.useCallback(async () => {
    setIsLoadingChecklist(true);
    try {
      const response = await exitServiceInstance.getAllChecklistItems();
      setChecklistItems(response.data || response || []);
    } catch (error) {
      console.error("Failed to fetch checklist items:", error);
    } finally {
      setIsLoadingChecklist(false);
    }
  }, [exitServiceInstance]);

  const fetchDepartments = React.useCallback(async () => {
    try {
      const response = await exitServiceInstance.getDepartments();
      const depts = response.data || response || [];
      setDepartments(depts);
      if (depts.length > 0) {
        setSelectedDeptId(depts[0].uniqueId || depts[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  }, [exitServiceInstance]);

  const fetchPrograms = React.useCallback(async () => {
    try {
      const response = await exitServiceInstance.getPrograms();
      setPrograms(response.data || response || []);
    } catch (error) {
      console.error("Failed to fetch programs:", error);
    }
  }, [exitServiceInstance]);

  const fetchLocations = React.useCallback(async () => {
    try {
      const response = await exitServiceInstance.getLocations();
      setLocations(response.data || response || []);
    } catch (error) {
      console.error("Failed to fetch locations:", error);
    }
  }, [exitServiceInstance]);

  useEffect(() => {
    fetchChecklistItems();
    loadUserData();
    fetchDepartments();
    fetchPrograms();
    fetchLocations();
  }, [fetchChecklistItems, loadUserData, fetchDepartments, fetchPrograms, fetchLocations]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checkbox.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (uniqueId: string) => {
    const isSelected = formData.selectedChecklistItems.includes(uniqueId);
    if (isSelected) {
      setFormData(prev => ({
        ...prev,
        selectedChecklistItems: prev.selectedChecklistItems.filter(id => id !== uniqueId)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        selectedChecklistItems: [...prev.selectedChecklistItems, uniqueId]
      }));
    }
  };



  const handleDateChange = (selectedDates: Date[]) => {
    if (selectedDates[0]) {
      const date = selectedDates[0];
      setFormData(prev => ({
        ...prev,
        resignationDate: date.toISOString().split('T')[0]
      }));
    }
  };

  const calculateLastWorkingDay = (resignationDate: string) => {
    if (!resignationDate) return "";
    const date = new Date(resignationDate);
    date.setMonth(date.getMonth() + 1);
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.resignationDate) {
      toast.error("Please select your resignation date");
      return;
    }

    if (!formData.reasonForLeaving) {
      toast.error("Please provide a reason for leaving");
      return;
    }

    if (!formData.handoverNotes) {
      toast.error("Please provide handover notes");
      return;
    }

    if (!formData.signature) {
      toast.error("Please sign the form to confirm");
      return;
    }

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
        reasonForLeaving: formData.reasonForLeaving,
        otherReason: formData.otherReason || "N/A",
        mostEnjoyed: formData.mostEnjoyed || "N/A",
        companyImprovement: formData.companyImprovement || "N/A",
        handoverNotes: formData.handoverNotes || "N/A",
        newEmployer: formData.newEmployer || "N/A",
        ratingCulture: Number(formData.ratingCulture),
        ratingJob: Number(formData.ratingJob),
        ratingManager: Number(formData.ratingManager),
        wouldRecommend: formData.wouldRecommend as 'Yes' | 'No' | 'Maybe',
        stage: 'Supervisor' as const,
        status: 'Pending' as const,
      };

      await exitServiceInstance.createExitInterview(exitInterviewData);
      toast.success("Exit interview submitted successfully!");
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error: any) {
      console.error("Exit interview submission error:", error);
      toast.error(error.response?.data?.message || "Failed to submit exit interview");
    } finally {
      setIsSubmitting(false);
    }
  };

  const groupedChecklistItems = checklistItems.reduce((acc, item) => {
    const deptName = item.departmentName || item.department || 'Unassigned';
    if (!acc[deptName]) {
      acc[deptName] = [];
    }
    acc[deptName].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-gray-500 font-bold tracking-tight">Synchronizing Employment Data...</div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="text-center p-20 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/30">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
          Submission Successful
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-sm mx-auto">
          Your exit request has been formally recorded and is being routed for approval.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 py-4">
      <div className="bg-gray-50/50 dark:bg-gray-800/20 rounded-[2rem] border border-gray-100 dark:border-gray-800 p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full -mr-32 -mt-32 blur-[100px] transition-all duration-1000 group-hover:bg-brand-500/10" />

        <h3 className="text-[11px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_15px_rgba(var(--color-brand-500),0.8)] animate-pulse"></span>
          Employee Record Reference
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-16 relative">
          {[
            { label: "Legal Name", value: currentUser ? `${currentUser.first_name || currentUser.firstName || ""} ${currentUser.last_name || currentUser.lastName || ""}`.trim() : "N/A", highlight: true },
            { label: "Staff ID", value: `#${currentUser?.staff_id || currentUser?.id || "N/A"}`, muted: true },
            { label: "Designation", value: currentUser?.designation || "N/A" },
            { label: "Department", value: currentUser?.department_name || currentUser?.department?.name || currentUser?.department || 'N/A' },
            { label: "Supervisor ID", value: `#${currentUser?.supervisor_id || "N/A"}`, muted: true },
            { label: "Primary Location", value: currentUser?.location_name || currentUser?.location?.name || currentUser?.location || 'N/A' },
            { label: "Program", value: currentUser?.program_name || currentUser?.program?.name || currentUser?.program || 'N/A' },
          ].map((item, idx) => (
            <div key={idx} className="space-y-2">
              <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] block">{item.label}</span>
              <p className={`text-lg font-bold ${item.highlight ? "text-gray-900 dark:text-white" : item.muted ? "text-gray-600 dark:text-gray-400" : "text-gray-900 dark:text-white"}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        <div className="space-y-8">
          <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-black">1</div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight text-brand-600">Resignation Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-sm font-black text-gray-800 dark:text-gray-200 ml-1">Resignation Date *</label>
              <div className="premium-datepicker">
                <DatePicker id="resignation-date" placeholder="Select formal date" onChange={handleDateChange} />
              </div>
              {formData.resignationDate && (
                <div className="flex items-center gap-2 px-3 py-2 bg-brand-50 dark:bg-brand-500/5 rounded-xl border border-brand-100 dark:border-brand-500/20 w-fit">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-500"></div>
                  <p className="text-[11px] font-bold text-brand-700 dark:text-brand-400 uppercase tracking-wider">
                    Notice Ends: {calculateLastWorkingDay(formData.resignationDate)}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="text-sm font-black text-gray-800 dark:text-gray-200 ml-1">Reason for Leaving *</label>
              <div className="relative">
                <select
                  name="reasonForLeaving"
                  value={formData.reasonForLeaving}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border-2 border-gray-100 bg-white dark:bg-gray-950 px-6 py-4 text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all font-bold appearance-none shadow-sm"
                  required
                >
                  <option value="">Select primary factor</option>
                  <option value="Better Opportunity">Better Opportunity</option>
                  <option value="Career Change">Career Change</option>
                  <option value="Further Education">Further Education</option>
                  <option value="Relocation">Relocation</option>
                  <option value="Personal Reasons">Personal Reasons</option>
                  <option value="Health Reasons">Health Reasons</option>
                  <option value="Retirement">Retirement</option>
                  <option value="Other">Other</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-6 pointer-events-none text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-3">
              <label className="text-sm font-black text-gray-800 dark:text-gray-200 ml-1">Formal Handover Notes</label>
              <textarea
                name="handoverNotes"
                value={formData.handoverNotes}
                onChange={handleInputChange}
                rows={5}
                placeholder="Detail critical tasks, project statuses, and system credentials/assets for return..."
                className="w-full rounded-[2rem] border-2 border-gray-100 bg-white dark:bg-gray-950 px-8 py-6 text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all font-bold resize-none shadow-inner"
              />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-black">2</div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight text-brand-600">Experience Audit</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Job Satisfaction</label>
              <select name="ratingJob" value={formData.ratingJob} onChange={handleInputChange} className="w-full rounded-xl border-2 border-gray-100 bg-white dark:bg-gray-950 px-5 py-3.5 text-gray-900 dark:text-white font-bold outline-none focus:border-brand-500 transition-all appearance-none">
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} - {n === 5 ? 'Excellent' : n === 1 ? 'Poor' : ''}</option>)}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Manager Effectiveness</label>
              <select name="ratingManager" value={formData.ratingManager} onChange={handleInputChange} className="w-full rounded-xl border-2 border-gray-100 bg-white dark:bg-gray-950 px-5 py-3.5 text-gray-900 dark:text-white font-bold outline-none focus:border-brand-500 transition-all appearance-none">
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} - {n === 5 ? 'Excellent' : n === 1 ? 'Poor' : ''}</option>)}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Culture Rating</label>
              <select name="ratingCulture" value={formData.ratingCulture} onChange={handleInputChange} className="w-full rounded-xl border-2 border-gray-100 bg-white dark:bg-gray-950 px-5 py-3.5 text-gray-900 dark:text-white font-bold outline-none focus:border-brand-500 transition-all appearance-none">
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} - {n === 5 ? 'Excellent' : n === 1 ? 'Poor' : ''}</option>)}
              </select>
            </div>

            <div className="md:col-span-3 space-y-4">
              <label className="text-sm font-black text-gray-800 dark:text-gray-200 ml-1">Would you recommend Mercy Corps to global professionals? *</label>
              <div className="flex gap-6">
                {['Yes', 'No', 'Maybe'].map((option) => (
                  <label key={option} className={`flex-1 flex items-center justify-center gap-3 p-5 rounded-2xl border-2 cursor-pointer transition-all ${formData.wouldRecommend === option
                    ? 'bg-brand-500 border-brand-500 text-white shadow-xl shadow-brand-500/20'
                    : 'border-gray-100 dark:border-gray-800 hover:border-brand-200 dark:hover:border-brand-900 text-gray-400'
                    }`}>
                    <input
                      type="radio"
                      name="wouldRecommend"
                      value={option}
                      checked={formData.wouldRecommend === option}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <span className="text-base font-black tracking-tight">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="md:col-span-3 space-y-3">
              <label className="text-sm font-black text-gray-800 dark:text-gray-200 ml-1">Highlights of Tenure</label>
              <textarea
                name="mostEnjoyed"
                value={formData.mostEnjoyed}
                onChange={handleInputChange}
                rows={3}
                placeholder="What aspects of the mission or culture were most fulfilling?"
                className="w-full rounded-2xl border-2 border-gray-100 bg-white dark:bg-gray-950 px-6 py-4 text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all font-bold resize-none shadow-sm"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 dark:bg-brand-500/10 p-10 rounded-[2.5rem] border border-gray-800 dark:border-brand-500/20 shadow-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white font-black">3</div>
            <h3 className="text-xl font-black text-white tracking-tight">Clearance Synchronization</h3>
          </div>



          {isLoadingChecklist ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-10">
              {Object.entries(groupedChecklistItems).map(([deptName, items]) => (
                <div key={deptName} className="animate-in fade-in slide-in-from-bottom-2">
                  <p className="text-[10px] font-black text-brand-500 mb-4 border-l-2 border-brand-500 pl-3 uppercase tracking-[0.2em]">{deptName} Global Clearance</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((item) => (
                      <div key={item.uniqueId} className="flex items-center justify-between group p-5 bg-gray-800/40 dark:bg-gray-950/40 hover:bg-gray-800 dark:hover:bg-gray-950 rounded-[1.25rem] transition-all border border-gray-800/50 hover:border-brand-500/30">
                        <label className="flex items-center gap-4 cursor-pointer flex-grow">
                          <input
                            type="checkbox"
                            checked={formData.selectedChecklistItems.includes(item.uniqueId || "")}
                            onChange={() => handleCheckboxChange(item.uniqueId || "")}
                            className="h-6 w-6 rounded-lg border-2 border-gray-700 bg-gray-900 text-brand-500 focus:ring-brand-500/20 transition-all"
                          />
                          <span className="text-base font-bold text-gray-300 group-hover:text-white transition-colors">{item.name}</span>
                        </label>

                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-brand-50/30 dark:bg-brand-500/5 p-8 rounded-3xl border border-brand-100 dark:border-brand-500/20 border-dashed">
            <div className="flex items-start gap-4">
              <div className="relative flex items-center h-6">
                <input
                  type="checkbox"
                  name="signature"
                  id="signature"
                  checked={formData.signature}
                  onChange={handleInputChange}
                  className="w-6 h-6 text-brand-500 border-2 border-brand-200 dark:border-brand-900 rounded-lg focus:ring-brand-500 shadow-sm"
                  required
                />
              </div>
              <label htmlFor="signature" className="text-base font-bold text-gray-700 dark:text-gray-300 leading-relaxed tracking-tight">
                I formally certify that the data encapsulated in this submission is accurate. I acknowledge that this step initiates the global separation protocol at Mercy Corps.
              </label>
            </div>
          </div>

          <div className="flex gap-4 justify-end pt-10">
            <button type="button" onClick={onClose} className="px-12 py-5 text-sm font-black text-gray-500 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Discard</button>
            <div className="group relative">
              <div className="absolute -inset-1 bg-brand-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
              <button
                type="submit"
                disabled={isSubmitting}
                className="relative px-14 py-5 text-base font-black text-white bg-gray-900 dark:bg-brand-500 rounded-2xl hover:scale-[1.03] active:scale-95 disabled:opacity-50 shadow-2xl transition-all flex items-center gap-3"
              >
                {isSubmitting ? "Finalizing Submission..." : "Execute Formal Exit"}
                {!isSubmitting && (
                  <svg className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
