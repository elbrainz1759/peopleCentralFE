import { api } from '@/lib/api';
import { UserCreateRequest, EmployeeCreateRequest, Employee, PaginatedResponse, CreateLeaveTypeRequest, LeaveType } from '@/types/service.types';

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

    public async createProgram(data: {
        name: string,
        fundCode?: number,
        startDate?: string,
        endDate?: string,
        country?: string,
    }): Promise<any> {
        return api.post('/programs', data);
    }

    public async createCountry(data: { name: string, unique_id?: string, created_by?: string }): Promise<any> {
        return api.post('/countries', data);
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

    public async createLeaveType(data: CreateLeaveTypeRequest): Promise<any> {
        return api.post('/leave-types', data);
    }

    public async getAllLeaveTypes(page = 1, limit = 10): Promise<PaginatedResponse<LeaveType>> {
        return api.get(`/leave-types?page=${page}&limit=${limit}`);
    }
}

export const userService = UserService.getInstance();
