import { api } from '@/lib/api';
import { UserCreateRequest, EmployeeCreateRequest, Employee, PaginatedResponse, CreateLeaveTypeRequest, LeaveType, ApproveUserRequest } from '@/types/service.types';

export class UserService {
    private static instance: UserService;

    private constructor() { }

    public static getInstance(): UserService {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        }
        return UserService.instance;
    }

    /**
     * creates a new user profile/account
     */
    public async create(userData: UserCreateRequest): Promise<any> {
        try {
            const response = await api.post<any>('/auth/register', userData);
            return response;
        } catch (error) {
            console.error('UserService create error:', error);
            throw error;
        }
    }

    /**
     * Update a user profile/account (admin or self-service)
     */

    public async update(id:string, userData: Partial<UserCreateRequest>): Promise<any> {
        try {
            const response = await api.patch<any>(`/users/${id}`, userData);
            return response;
        } catch (error) {
            console.error('UserService update error:', error);
            throw error;
        }
    }


    /**
   * creates a new employee profile
   */
    public async createEmployee(employeeData: EmployeeCreateRequest): Promise<any> {
        try {
            const response = await api.post<any>('/employees', employeeData);
            return response;
        } catch (error) {
            console.error('UserService createEmployee error:', error);
            throw error;
        }
    }

    /**
     * Approves a pending user account and assigns role and supervisor
     */
    public async approveEmployee(approveData: ApproveUserRequest): Promise<any> {

        try { 
            const response = await api.post<any>('/auth/approve', approveData);
            return response;
        } catch (error) {
            console.error('UserService approveUser error:', error);
            throw error;
        }

    }

    /**
     * updates an existing employee profile
     */
    public async updateEmployee(id: string, employeeData: Partial<EmployeeCreateRequest>): Promise<any> {
        try {
            const response = await api.patch<any>(`/employees/${id}`, employeeData);
            return response;
        } catch (error) {
            console.error('UserService updateEmployee error:', error);
            throw error;
        }
    }

    /**
     * gets a list of all users
     */
    public async getAll(): Promise<any[]> {
        try {
            return await api.get<any[]>('/users');
        } catch (error) {
            console.error('UserService getAll error:', error);
            throw error;
        }
    }

    public async updateUserRole(id: string, role: string): Promise<any> {
        return api.patch<any>(`/users/${id}`, { role });
    }

    public async deleteUser(id: string): Promise<any> {
        return api.delete(`/users/${id}`);
    }

    /**
     * gets user details by id
     */
    public async getById(id: string): Promise<any> {
        try {
            return await api.get<any>(`/users/${id}`);
        } catch (error) {
            console.error('UserService getById error:', error);
            throw error;
        }
    }
    /**
     * gets a list of all employees
     */
    public async getAllEmployees(): Promise<PaginatedResponse<Employee>> {
        try {
            return await api.get<PaginatedResponse<Employee>>('/employees');
        } catch (error) {
            console.error('UserService getAllEmployees error:', error);
            throw error;
        }
    }

    /**
     * Administrative: Management of Departments, Programs, Countries
     */
    public async createDepartment(data: { name: string, unique_id?: string, created_by?: string }): Promise<any> {
        return api.post('/departments', data);
    }

    public async updateDepartment(uniqueId: string, data: { name: string }): Promise<any> {
        return api.patch(`/departments/${uniqueId}`, data);
    }

    public async deleteDepartment(uniqueId: string): Promise<any> {
        return api.delete(`/departments/${uniqueId}`);
    }

    public async createProgram(data: {
        name: string,
        fundCode?: number,
        startDate?: string,
        endDate?: string,
        country?: string,
    }): Promise<any> {
        return api.post('/programs', data);
    }

    public async updateProgram(uniqueId: string, data: {
        name: string,
        fundCode?: number,
        startDate?: string,
        endDate?: string,
        country?: string,
    }): Promise<any> {
        return api.patch(`/programs/${uniqueId}`, data);
    }

    public async deleteProgram(uniqueId: string): Promise<any> {
        return api.delete(`/programs/${uniqueId}`);
    }

    public async getAllRoles(): Promise<any[]> {
        return api.get('/roles');
    }

    public async createRole(data: { name: string; description?: string }): Promise<any> {
        return api.post('/roles', data);
    }

    public async updateRole(uniqueId: string, data: { name: string; description?: string }): Promise<any> {
        return api.patch(`/roles/${uniqueId}`, data);
    }

    public async deleteRole(uniqueId: string): Promise<any> {
        return api.delete(`/roles/${uniqueId}`);
    }

    public async createCountry(data: { name: string, unique_id?: string, created_by?: string }): Promise<any> {
        return api.post('/countries', data);
    }

    public async updateCountry(uniqueId: string, data: { name: string }): Promise<any> {
        return api.patch(`/countries/${uniqueId}`, data);
    }

    public async deleteCountry(uniqueId: string): Promise<any> {
        return api.delete(`/countries/${uniqueId}`);
    }

    public async getAllDepartments(): Promise<any[]> {
        return api.get('/departments');
    }

    public async getAllPrograms(): Promise<any[]> {
        return api.get('/programs');
    }

    public async getAllCountries(): Promise<any[]> {
        return api.get('/countries');
    }

    public async getAllLocations(): Promise<any[]> {
        return api.get('/locations');
    }

    public async createLocation(data: { name: string; countryId: string }): Promise<any> {
        return api.post('/locations', data);
    }

    public async updateLocation(uniqueId: string, data: { name: string; countryId: string }): Promise<any> {
        return api.patch(`/locations/${uniqueId}`, data);
    }

    public async deleteLocation(uniqueId: string): Promise<any> {
        return api.delete(`/locations/${uniqueId}`);
    }

    public async createLeaveType(data: CreateLeaveTypeRequest): Promise<any> {
        return api.post('/leave-types', data);
    }

    public async updateLeaveType(uniqueId: string, data: Partial<CreateLeaveTypeRequest>): Promise<any> {
        return api.patch(`/leave-types/${uniqueId}`, data);
    }

    public async deleteLeaveType(uniqueId: string): Promise<any> {
        return api.delete(`/leave-types/${uniqueId}`);
    }

    public async getAllLeaveTypes(page = 1, limit = 10): Promise<PaginatedResponse<LeaveType>> {
        return api.get(`/leave-types?page=${page}&limit=${limit}`);
    }

    public async createLeaveTypeConfig(data: any): Promise<any> {
        return api.post('/leave-type-configs', data);
    }

    public async getAllLeaveTypeConfigs(page = 1, limit = 10): Promise<PaginatedResponse<any>> {
        return api.get(`/leave-type-configs?page=${page}&limit=${limit}`);
    }

    public async updateLeaveTypeConfig(uniqueId: string, data: any): Promise<any> {
        return api.patch(`/leave-type-configs/${uniqueId}`, data);
    }

    public async deleteLeaveTypeConfig(uniqueId: string): Promise<any> {
        return api.delete(`/leave-type-configs/${uniqueId}`);
    }
}

export const userService = UserService.getInstance();
