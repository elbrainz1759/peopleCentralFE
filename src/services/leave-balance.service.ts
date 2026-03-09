import { api } from '@/lib/api';

export interface LeaveBalance {
  id?: number;
  unique_id?: string;
  staff_id: number;
  leave_type_id: number;
  total_hours: string;
  used_hours?: string;
  remaining_hours?: string;
  created_by?: string;
  created_at?: string;
  leave_type_name?: string;
}

export interface BulkUploadRequest {
  staffId: number;
  leaveTypeId: number;
  totalHours: number;
}

export class LeaveBalanceService {
  private static instance: LeaveBalanceService;

  private constructor() { }

  public static getInstance(): LeaveBalanceService {
    if (!LeaveBalanceService.instance) {
      LeaveBalanceService.instance = new LeaveBalanceService();
    }
    return LeaveBalanceService.instance;
  }

  /**
   * Bulk upload leave balances
   */
  async bulkUploadLeaveBalances(balances: BulkUploadRequest[]): Promise<any> {
    try {
      const response = await api.post<any>('/leave-balances/bulk-upload', { balances });
      return response;
    } catch (error) {
      console.error('LeaveBalanceService bulkUpload error:', error);
      throw error;
    }
  }

  /**
   * Get leave balance by staff ID
   */
  async getLeaveBalanceByStaffId(staffId: number): Promise<any> {
    try {
      const response = await api.get<any>(`/leave-balances/staff/${staffId}`);
      return response;
    } catch (error) {
      console.error('LeaveBalanceService getByStaffId error:', error);
      throw error;
    }
  }

  /**
   * Get leave balance transactions by staff ID
   */
  async getLeaveBalanceTransactionsByStaffId(staffId: number, page = 1, limit = 20): Promise<any> {
    try {
      const response = await api.get<any>(`/leave-balances/staff/${staffId}/transactions?page=${page}&limit=${limit}`);
      return response;
    } catch (error) {
      console.error('LeaveBalanceService getTransactions error:', error);
      throw error;
    }
  }

  /**
   * Update leave balance
   */
  async updateLeaveBalance(id: number, data: Partial<LeaveBalance>): Promise<any> {
    try {
      const response = await api.put<any>(`/leave-balances/${id}`, data);
      return response;
    } catch (error) {
      console.error('LeaveBalanceService update error:', error);
      throw error;
    }
  }

  /**
   * Delete leave balance
   */
  async deleteLeaveBalance(id: number): Promise<any> {
    try {
      const response = await api.delete<any>(`/leave-balances/${id}`);
      return response;
    } catch (error) {
      console.error('LeaveBalanceService delete error:', error);
      throw error;
    }
  }
}

export const leaveBalanceService = LeaveBalanceService.getInstance();
