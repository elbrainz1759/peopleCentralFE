import { api } from '@/lib/api';
import { AuthResponse, LoginRequest, RefreshRequest } from '@/types/service.types';

export class AuthService {
    private static instance: AuthService;

    private constructor() { }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    private decodeToken(token: string): any {
        try {
            const payload = token.split('.')[1];
            return JSON.parse(atob(payload));
        } catch {
            return null;
        }
    }

    /**
     * authenticates a user with email and password
     */
    public async login(credentials: LoginRequest): Promise<AuthResponse & { user?: any }> {
        try {
            const response = await api.post<AuthResponse>('/auth/login', credentials);

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

            // Decode JWT to get user identity, then fetch full profile (includes passChanged)
            let userProfile: any = null;
            if (token) {
                const decoded = this.decodeToken(token);
                if (decoded?.unique_id) {
                    try {
                        userProfile = await api.get<any>(`/users/${decoded.unique_id}`);
                        localStorage.setItem('auth_user', JSON.stringify(userProfile));
                    } catch {
                        userProfile = decoded;
                        localStorage.setItem('auth_user', JSON.stringify(decoded));
                    }
                } else if (decoded) {
                    userProfile = decoded;
                    localStorage.setItem('auth_user', JSON.stringify(decoded));
                }
            }

            return { ...response, user: userProfile };
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
     * changes the user's password (used on forced first-time change)
     */
    public async changePassword(data: { newPassword: string }): Promise<any> {
        try {
            const response = await api.post<any>('/auth/reset-password', data);
            return response;
        } catch (error) {
            console.error('AuthService changePassword error:', error);
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
