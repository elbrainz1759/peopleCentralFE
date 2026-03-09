export interface AuthResponse {
    accessToken: string;
    refreshToken?: string;
    token?: string; // Keep for backward compatibility if needed
    user?: {
        id: string;
        unique_id?: string;
        email: string;
        role: string;
        firstName?: string;
        lastName?: string;
    };
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    role: 'User' | 'Admin' | 'Superadmin';
}

export interface RefreshRequest {
    refreshToken: string;
}

export interface UserCreateRequest extends RegisterRequest { }

export interface EmployeeCreateRequest {
    firstName: string;
    lastName: string;
    staffId: number;
    email: string;
    designation?: string;
    locationId?: string;
    supervisorId?: string;
    programId?: string;
    departmentId?: string;
    countryId?: string;
}

export interface Employee {
    id: number | string;
    unique_id: string;
    first_name: string;
    last_name: string;
    staff_id: number | string;
    email: string;
    location: string;
    supervisor: string;
    program: string;
    created_by?: string;
    created_at: string;
    department: string;
    country: string;
    location_name?: string | null;
    department_name?: string | null;
    program_name?: string | null;
    supervisor_first_name?: string | null;
    supervisor_last_name?: string | null;
    supervisor_name?: string | null;

    // Optional fields that might be mapped or provided by transition
    designation?: string;
    supervisor_id?: number;
    status: "Active" | "On-boarding" | "Suspended" | "Exited" | string;
    joinedDate?: string;
    contractStart?: string;
    contractEnd?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages?: number;
        last_page?: number;
    };
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface CreateLeaveTypeRequest {
    name: string;
    description: string;
    country: string;
}

export interface LeaveType {
    id: number | string;
    unique_id?: string;
    name: string;
    description: string;
    country: string;
    created_by?: string;
    created_at?: string;
    updated_at?: string;
}

export interface LeaveRequest {
    staffId: number;
    leaveTypeId: number;
    reason: string;
    handoverNote: string;
    leaveDuration: {
        startDate: string;
        endDate: string;
    }[];
}   