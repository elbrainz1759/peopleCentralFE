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
  stage: 'Supervisor' | 'Operations' | 'Finance' | 'HR' | 'Completed';
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
  department: string; // Department UUID
  departmentName?: string; // Department name from API
  createdBy?: string;
  createdAt?: string;
}

// Exit Clearance Interface (department-specific clearances)
export interface ExitClearance {
  id?: number;
  uniqueId?: string;
  exitInterviewId: number;
  checklistItemId: number;
  departmentId: number;
  clearedBy: number;
  status: 'Pending' | 'Cleared' | 'Not Returned';
  notes?: string;
  clearedAt?: string;
  createdAt?: string;
}

// Exit Approval Interface
export interface ExitApproval {
  id?: number;
  exitInterviewId: number;
  approverId: number;
  approverRole: 'Supervisor' | 'Operations' | 'Finance' | 'HR';
  status: 'Pending' | 'Approved' | 'Rejected';
  comments?: string;
  approvedAt?: string;
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
  async getAllExitInterviews(page = 1, limit = 20, status?: string): Promise<any> {
    try {
      let url = `/exit-interviews?page=${page}&limit=${limit}`;
      if (status && status !== 'All') url += `&status=${status}`;
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
  async getExitInterviewById(id: number): Promise<any> {
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
    id: number, 
    payload: { 
      department: 'Operations' | 'Finance'; 
      checkListItemIds: number[]; 
      notes?: string 
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
  async updateChecklistItem(id: number, itemData: Partial<ChecklistItem>): Promise<any> {
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
  async deleteChecklistItem(id: number): Promise<any> {
    try {
      const response = await api.delete<any>(`/check-list-items/${id}`);
      return response;
    } catch (error) {
      console.error('ExitService deleteChecklistItem error:', error);
      throw error;
    }
  }

  // --- Exit Clearance Management ---

  /**
   * Get clearances for an exit interview
   */
  async getClearancesByInterviewId(interviewId: number): Promise<any> {
    try {
      const response = await api.get<any>(`/exit-clearances/interview/${interviewId}`);
      return response;
    } catch (error) {
      console.error('ExitService getClearancesByInterviewId error:', error);
      throw error;
    }
  }

  /**
   * Update clearance status
   */
  async updateClearance(id: number, clearanceData: Partial<ExitClearance>): Promise<any> {
    try {
      const response = await api.patch<any>(`/exit-clearances/${id}`, clearanceData);
      return response;
    } catch (error) {
      console.error('ExitService updateClearance error:', error);
      throw error;
    }
  }

  // --- Exit Approval Management ---

  /**
   * Get approvals for an exit interview
   */
  async getApprovalsByInterviewId(interviewId: number): Promise<any> {
    try {
      const response = await api.get<any>(`/exit-approvals/interview/${interviewId}`);
      return response;
    } catch (error) {
      console.error('ExitService getApprovalsByInterviewId error:', error);
      throw error;
    }
  }

  /**
   * Create exit approval
   */
  async createApproval(approvalData: Partial<ExitApproval>): Promise<any> {
    try {
      const response = await api.post<any>('/exit-approvals', approvalData);
      return response;
    } catch (error) {
      console.error('ExitService createApproval error:', error);
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
