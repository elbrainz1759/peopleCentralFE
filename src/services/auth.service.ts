import { api } from '@/lib/api';
import { AuthResponse, LoginRequest, RegisterRequest, RefreshRequest } from '@/types/service.types';

export class AuthService {
    private static instance: AuthService;

    private constructor() { }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    /**
     * authenticates a user with email and password
     */
    public async login(credentials: LoginRequest): Promise<AuthResponse> {
        try {
            const response = await api.post<AuthResponse>('/auth/login', credentials);
            console.log('AuthService login response:', response);

            // Store token if found in either accessToken or token field
            const token = response.accessToken || response.token;
            const refreshToken = response.refreshToken;

            if (token) {
                console.log('AuthService: Storing auth_token');
                localStorage.setItem('auth_token', token);
                document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Lax`;
            }

            if (refreshToken) {
                console.log('AuthService: Storing refresh_token');
                localStorage.setItem('refresh_token', refreshToken);
                document.cookie = `refresh_token=${refreshToken}; path=/; max-age=604800; SameSite=Lax`; // 7 days
            }

            const userToStore = response.user || (response as any).data?.user;

            if (userToStore) {
                console.log('AuthService: Storing auth_user', userToStore);
                localStorage.setItem('auth_user', JSON.stringify(userToStore));
            } else if ((response as any).id || (response as any).staff_id || (response as any).staffId) {
                // If the response object itself looks like a user object
                console.log('AuthService: Storing response as auth_user');
                localStorage.setItem('auth_user', JSON.stringify(response));
            } else {
                console.warn('AuthService: No user found in login response keys:', Object.keys(response));
            }

            return response;
        } catch (error) {
            console.error('AuthService login error:', error);
            throw error;
        }
    }

    /**
     * gets the currently logged-in user from storage
     */
    public getCurrentUser(): any {
        if (typeof window === 'undefined') return null;
        const user = localStorage.getItem('auth_user');
        const parsedUser = user ? JSON.parse(user) : null;
        console.log('AuthService getCurrentUser:', parsedUser);
        return parsedUser;
    }

    public async register(userData: RegisterRequest): Promise<AuthResponse> {
        try {
            const response = await api.post<AuthResponse>('/auth/register', userData);

            const token = response.accessToken || response.token;
            const refreshToken = response.refreshToken;

            if (token) {
                localStorage.setItem('auth_token', token);
                document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Lax`;
            }

            if (refreshToken) {
                localStorage.setItem('refresh_token', refreshToken);
                document.cookie = `refresh_token=${refreshToken}; path=/; max-age=604800; SameSite=Lax`;
            }

            if (response.user) {
                localStorage.setItem('auth_user', JSON.stringify(response.user));
            }

            return response;
        } catch (error) {
            console.error('AuthService register error:', error);
            throw error;
        }
    }

    /**
     * gets a new token using refresh token
     */
    public async refresh(refreshData: RefreshRequest): Promise<AuthResponse> {
        try {
            const response = await api.post<AuthResponse>('/auth/refresh', refreshData);

            const token = response.accessToken || response.token;
            const refreshToken = response.refreshToken || refreshData.refreshToken; // Keep old refresh if new not sent

            if (token) {
                localStorage.setItem('auth_token', token);
                document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Lax`;
            }

            if (refreshToken) {
                localStorage.setItem('refresh_token', refreshToken);
                document.cookie = `refresh_token=${refreshToken}; path=/; max-age=604800; SameSite=Lax`;
            }

            if (response.user) {
                localStorage.setItem('auth_user', JSON.stringify(response.user));
            }

            return response;
        } catch (error) {
            console.error('AuthService refresh error:', error);
            throw error;
        }
    }

    /**
     * logs out the user
     */
    public logout(): void {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('auth_user');
        document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        window.location.href = '/';
    }

    /**
     * checks if user is authenticated
     */
    public isAuthenticated(): boolean {
        return !!localStorage.getItem('auth_token');
    }
}

export const authService = AuthService.getInstance();
