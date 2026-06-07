import { api, apiRequest } from "../lib/api";
import { LeaveRequest } from "@/types/service.types";

export interface LeaveDuration {
    id: number;
    leave_id: number;
    start_date: string;
    end_date: string;
    hours: string;
}

export interface Leave {
    id: number;
    unique_id: string;
    staff_id: number;
    leave_type_id: number;
    reason: string;
    handover_note: string;
    total_hours: string;
    status: string;
    created_by: string;
    created_at: string;
    durations: LeaveDuration[];
}

export class leaveService {
    private static instance: leaveService;

    private constructor() { }

    public static getInstance(): leaveService {
        if (!leaveService.instance) {
            leaveService.instance = new leaveService();
        }
        return leaveService.instance;
    }

    async applyForLeave(leaveData: LeaveRequest): Promise<any> {
        try {
            if (leaveData.document instanceof File) {
                const fd = new FormData();
                fd.append('staffId', String(leaveData.staffId));
                fd.append('leaveDuration', JSON.stringify(leaveData.leaveDuration));
                if (leaveData.reason) fd.append('reason', leaveData.reason);
                if (leaveData.handoverNotes?.length) {
                    fd.append('handoverNotes', JSON.stringify(leaveData.handoverNotes));
                }
                fd.append('document', leaveData.document);
                return await apiRequest<any>('/leaves', { method: 'POST', body: fd });
            }
            return await api.post<any>('/leaves', leaveData);
        } catch (error) {
            console.error('LeaveService applyForLeave error:', error);
            throw error;
        }
    }

    async getAllLeaves(page = 1, limit = 10, status?: string, staffId?: number, signal?: AbortSignal): Promise<any> {
        try {
            let url = `/leaves?page=${page}&limit=${limit}`;
            if (status && status !== 'All') url += `&status=${status}`;
            if (staffId) url += `&staffId=${staffId}`;
            const response = await api.get<any>(url, signal ? { signal } : undefined);
            return response;
        } catch (error) {
            console.error('LeaveService getAllLeaves error:', error);
            throw error;
        }
    }

    async getUserLeaves(staffId: number, page = 1, limit = 10): Promise<any> {
        try {
            const response = await api.get<any>(`/leaves/${staffId}?page=${page}&limit=${limit}`);
            return response;
        } catch (error) {
            console.error('LeaveService getUserLeaves error:', error);
            throw error;
        }
    }

    async reviewLeave(leaveId: number, comments?: string): Promise<any> {
        try {
            const response = await api.patch<any>(`/leaves/${leaveId}/review`, { comments });
            return response;
        } catch (error) {
            console.error('LeaveService reviewLeave error:', error);
            throw error;
        }
    }

    async approveLeave(leaveId: number, comments?: string): Promise<any> {
        try {
            const response = await api.patch<any>(`/leaves/${leaveId}/approve`, { comments });
            return response;
        } catch (error) {
            console.error('LeaveService approveLeave error:', error);
            throw error;
        }
    }

    async rejectLeave(leaveId: number, comments?: string): Promise<any> {
        try {
            const response = await api.patch<any>(`/leaves/${leaveId}/reject`, { comments });
            return response;
        } catch (error) {
            console.error('LeaveService rejectLeave error:', error);
            throw error;
        }
    }

    async getLeaveBalances(staffId: number): Promise<any> {
        try {
            const response = await api.get<any>(`/leave-balances/staff/${staffId}`);
            return response;
        } catch (error) {
            console.error('LeaveService getLeaveBalances error:', error);
            throw error;
        }
    }

    async getLeaveTransactions(staffId: number, page = 1, limit = 20): Promise<any> {
        try {
            const response = await api.get<any>(`/leave-balances/staff/${staffId}/transactions?page=${page}&limit=${limit}`);
            return response;
        } catch (error) {
            console.error('LeaveService getLeaveTransactions error:', error);
            throw error;
        }
    }

    async cancelLeave(leaveId: number, comments?: string): Promise<any> {
        try {
            const response = await api.patch<any>(`/leaves/${leaveId}/cancel`, { comments });
            return response;
        } catch (error) {
            console.error('LeaveService cancelLeave error:', error);
            throw error;
        }
    }

    async updateLeave(leaveId: number, data: Partial<{ reason: string; handoverNote: string; comments: string }>): Promise<any> {
        try {
            const response = await api.patch<any>(`/leaves/${leaveId}`, data);
            return response;
        } catch (error) {
            console.error('LeaveService updateLeave error:', error);
            throw error;
        }
    }

    async getLeaveTypes(): Promise<any> {
        try {
            const response = await api.get<any>('/leave-types');
            return response;
        } catch (error) {
            console.error('LeaveService getLeaveTypes error:', error);
            throw error;
        }
    }

    async getStaffDetails(id?: number | string): Promise<any> {
        try {
            let url = '/employees';
            if (id) {
                if (typeof id === 'string' && id.includes('@')) {
                    url += `?email=${encodeURIComponent(id)}`;
                } else if (!isNaN(Number(id))) {
                    url += `?staffId=${id}`;
                } else {
                    url += `/${id}`;
                }
            }
            const response = await api.get<any>(url);
            return response;
        } catch (error) {
            console.error('LeaveService getStaffDetails error:', error);
            throw error;
        }
    }
}

export const leaveServiceInstance = leaveService.getInstance();