import { api } from '@/lib/api';

// Exit Interview Interface (merged checklist + interview)
export interface ExitInterview {
  id?: number;
  uniqueId?: string;
  staffId: string | number;
  supervisorId: string | number;
  departmentId: string | number;
  programId?: string | number;
  locationId?: string | number;
  resignationDate: string;
  handoverNotes?: string;
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
  signature?: boolean;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  stage: 'Employee' | 'Supervisor' | 'Operations' | 'Finance' | 'HR' | 'Completed';
  clearanceChecklistItems?: string[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Checklist Item Interface (department-specific)
export interface ChecklistItem {
  id?: number;
  uniqueId?: string;
  name: string;
  department?: string; // Department UUID (legacy)
  departmentId?: string; // Department UUID (API field name)
  departmentName?: string; // Department name from API
  createdBy?: string;
  createdAt?: string;
}

export class ExitService {
  private static instance: ExitService;

  private constructor() { }

  public static getInstance(): ExitService {
    if (!ExitService.instance) {
      ExitService.instance = new ExitService();
    }
    return ExitService.instance;
  }

  /**
   * Create new exit interview (merged checklist + interview)
   */
  async createExitInterview(exitData: Partial<ExitInterview>): Promise<any> {
    try {
      const response = await api.post<any>('/exit-interviews', exitData);
      return response;
    } catch (error) {
      console.error('ExitService createExitInterview error:', error);
      throw error;
    }
  }

  /**
   * Get all exit interviews (for admins)
   */
  async getAllExitInterviews(page = 1, limit = 20, status?: string, staffId?: number | string): Promise<any> {
    try {
      let url = `/exit-interviews?page=${page}&limit=${limit}`;
      if (status && status !== 'All') url += `&status=${status}`;
      if (staffId) url += `&staffId=${staffId}`;
      const response = await api.get<any>(url);
      return response;
    } catch (error) {
      console.error('ExitService getAllExitInterviews error:', error);
      throw error;
    }
  }

  /**
   * Get specific exit interview
   */
  async getExitInterviewById(id: number | string): Promise<any> {
    try {
      const response = await api.get<any>(`/exit-interviews/${id}`);
      return response;
    } catch (error) {
      console.error('ExitService getExitInterviewById error:', error);
      throw error;
    }
  }

  /**
   * Update exit interview
   */
  async updateExitInterview(id: number, exitData: Partial<ExitInterview>): Promise<any> {
    try {
      const response = await api.patch<any>(`/exit-interviews/${id}`, exitData);
      return response;
    } catch (error) {
      console.error('ExitService updateExitInterview error:', error);
      throw error;
    }
  }

  /**
   * Advance the workflow stage on an exit interview.
   *
   * The backend's PATCH /exit-interviews/:id DTO requires every field to be
   * non-empty, so we fetch the current record first, remap snake_case to
   * camelCase, and resubmit the full payload with only the stage overridden.
   * Empty-but-required fields fall back to safe placeholders.
   */
  async advanceStage(id: number | string, newStage: string): Promise<any> {
    try {
      const fetched = await this.getExitInterviewById(id as any);
      const rec: any = fetched?.data || fetched || {};

      const pick = (...candidates: any[]) => {
        for (const c of candidates) {
          if (c !== undefined && c !== null && c !== '') return c;
        }
        return undefined;
      };

      const recommend = pick(rec.wouldRecommend, rec.would_recommend);
      const validRecommend = ['Yes', 'No', 'Maybe'].includes(recommend) ? recommend : 'Maybe';
      const status = pick(rec.status);
      const validStatus = ['Pending', 'Approved', 'Rejected'].includes(status) ? status : 'Pending';
      const resignationDate = pick(rec.resignationDate, rec.resignation_date);
      const isoDate = resignationDate ? new Date(resignationDate).toISOString() : new Date().toISOString();

      const payload: any = {
        staffId: pick(rec.staffId, rec.staff_id),
        supervisorId: pick(rec.supervisorId, rec.supervisor_id),
        departmentId: pick(rec.departmentId, rec.department_id),
        programId: pick(rec.programId, rec.program_id),
        locationId: pick(rec.locationId, rec.location_id),
        countryId: pick(rec.countryId, rec.country_id),
        resignationDate: isoDate,
        handoverNotes: pick(rec.handoverNotes, rec.handover_notes, 'N/A'),
        reasonForLeaving: pick(rec.reasonForLeaving, rec.reason_for_leaving, 'Other'),
        otherReason: pick(rec.otherReason, rec.other_reason, 'N/A'),
        newEmployer: pick(rec.newEmployer, rec.new_employer, 'N/A'),
        ratingJob: Math.max(1, Number(pick(rec.ratingJob, rec.rating_job)) || 1),
        ratingManager: Math.max(1, Number(pick(rec.ratingManager, rec.rating_manager)) || 1),
        ratingCulture: Math.max(1, Number(pick(rec.ratingCulture, rec.rating_culture)) || 1),
        mostEnjoyed: pick(rec.mostEnjoyed, rec.most_enjoyed, 'N/A'),
        companyImprovement: pick(rec.companyImprovement, rec.company_improvement, 'N/A'),
        wouldRecommend: validRecommend,
        status: validStatus,
        stage: newStage,
      };

      const response = await api.patch<any>(`/exit-interviews/${id}`, payload);
      return response;
    } catch (error) {
      console.error('ExitService advanceStage error:', error);
      throw error;
    }
  }

  async saveHRAssessment(
    id: number | string,
    _assessment: { assessmentNotes: string; keyThemes: string; recommendation: string; assessedBy: string; assessedAt: string }
  ): Promise<any> {
    // Assessment text stored in localStorage; this call clears the HR stage.
    return api.post<any>(`/exit-interviews/${id}/clear`, {
      department: 'HR',
      checkListItemIds: [],
      notes: 'HR assessment completed',
    });
  }

  /**
   * Delete exit interview
   */
  async deleteExitInterview(id: number): Promise<any> {
    try {
      const response = await api.delete<any>(`/exit-interviews/${id}`);
      return response;
    } catch (error) {
      console.error('ExitService deleteExitInterview error:', error);
      throw error;
    }
  }

  /**
   * Get pending exit interviews by department
   */
  async getPendingExitInterviewsByDepartment(department: 'Operations' | 'Finance' | string, page = 1, limit = 20): Promise<any> {
    try {
      const response = await api.get<any>(`/exit-interviews/pending/${department}?page=${page}&limit=${limit}`);
      return response;
    } catch (error) {
      console.error(`ExitService getPendingExitInterviewsByDepartment error for ${department}:`, error);
      throw error;
    }
  }

  /**
   * Operations or Finance clears their items
   */
  async clearExitInterviewItems(
    id: number | string,
    payload: {
      department: 'Supervisor' | 'Operations' | 'Finance' | 'HR' | 'HR_Director';
      checkListItemIds: number[];
      notes?: string;
    }
  ): Promise<any> {
    try {
      const response = await api.post<any>(`/exit-interviews/${id}/clear`, payload);
      return response;
    } catch (error) {
      console.error(`ExitService clearExitInterviewItems error for ${payload.department}:`, error);
      throw error;
    }
  }

  /**
   * HR final submission
   */
  async finalizeExitInterview(id: number): Promise<any> {
    try {
      const response = await api.patch<any>(`/exit-interviews/${id}/finalize`, {});
      return response;
    } catch (error) {
      console.error('ExitService finalizeExitInterview error:', error);
      throw error;
    }
  }

  /**
   * Get exit interview dashboard stats
   */
  async getDashboard(): Promise<any> {
    try {
      const response = await api.get<any>('/exit-interviews/dashboard');
      return response;
    } catch (error) {
      console.error('ExitService getDashboard error:', error);
      throw error;
    }
  }

  // --- Checklist Item Management ---

  /**
   * Get all checklist items
   */
  async getAllChecklistItems(): Promise<any> {
    try {
      const response = await api.get<any>('/check-list-items');
      return response;
    } catch (error) {
      console.error('ExitService getAllChecklistItems error:', error);
      throw error;
    }
  }

  /**
   * Create checklist item
   */
  async createChecklistItem(itemData: Partial<ChecklistItem>): Promise<any> {
    try {
      const response = await api.post<any>('/check-list-items', itemData);
      return response;
    } catch (error) {
      console.error('ExitService createChecklistItem error:', error);
      throw error;
    }
  }

  /**
   * Update checklist item
   */
  async updateChecklistItem(id: string, itemData: Partial<ChecklistItem>): Promise<any> {
    try {
      const response = await api.patch<any>(`/check-list-items/${id}`, itemData);
      return response;
    } catch (error) {
      console.error('ExitService updateChecklistItem error:', error);
      throw error;
    }
  }

  /**
   * Delete checklist item
   */
  async deleteChecklistItem(id: string): Promise<any> {
    try {
      const response = await api.delete<any>(`/check-list-items/${id}`);
      return response;
    } catch (error) {
      console.error('ExitService deleteChecklistItem error:', error);
      throw error;
    }
  }

  async getDepartments(): Promise<any> {
    try {
      const response = await api.get<any>('/departments');
      return response;
    } catch (error) {
      console.error('ExitService getDepartments error:', error);
      throw error;
    }
  }

  async getPrograms(): Promise<any> {
    try {
      const response = await api.get<any>('/programs');
      return response;
    } catch (error) {
      console.error('ExitService getPrograms error:', error);
      throw error;
    }
  }

  async getLocations(): Promise<any> {
    try {
      const response = await api.get<any>('/locations');
      return response;
    } catch (error) {
      console.error('ExitService getLocations error:', error);
      throw error;
    }
  }

  // Static helper for quick access if needed
  public static getChecklistItems() {
    return this.getInstance().getAllChecklistItems();
  }

  public static getDepartments() {
    return this.getInstance().getDepartments();
  }

  public static createChecklistItem(data: any) {
    return this.getInstance().createChecklistItem(data);
  }

  public static deleteChecklistItem(id: any) {
    return this.getInstance().deleteChecklistItem(id);
  }

  public static createExitInterview(data: any) {
    return this.getInstance().createExitInterview(data);
  }
}

export const exitServiceInstance = ExitService.getInstance();
