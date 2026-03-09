export const API_CONFIG = {
    BASE_URL: process.env.NEXT_PUBLIC_BASE_API_URL || 'https://d17gqyseyowaqt.cloudfront.net',
    TIMEOUT: 15000,
};

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions extends RequestInit {
    params?: Record<string, string>;
}

export async function apiRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<T> {
    const { params, ...customOptions } = options;

    let url = `${API_CONFIG.BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    if (params) {
        const searchParams = new URLSearchParams(params);
        url += `?${searchParams.toString()}`;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    console.log(`[API REQUEST] ${options.method || 'GET'} ${url}`, {
        hasToken: !!token,
        body: options.body ? JSON.parse(options.body as string) : null,
        fullUrl: url,
        baseUrl: API_CONFIG.BASE_URL
    });

    const defaultOptions: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...(customOptions.headers || {}),
        },
        ...customOptions,
    };

    try {
        const response = await fetch(url, defaultOptions);

        // Handle Token Expiration (401)
        if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
            const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;

            if (refreshToken) {
                try {
                    console.log('Got 401, attempting token refresh...');
                    // Try to refresh the token
                    const refreshResponse = await fetch(`${API_CONFIG.BASE_URL}/auth/refresh`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refreshToken: refreshToken })
                    });

                    if (refreshResponse.ok) {
                        const data = await refreshResponse.json();
                        const newToken = data.accessToken || data.token;
                        const newRefresh = data.refreshToken || refreshToken;

                        if (newToken) {
                            console.log('Refresh successful! Updating tokens and retrying original request.');
                            localStorage.setItem('auth_token', newToken);
                            document.cookie = `auth_token=${newToken}; path=/; max-age=86400; SameSite=Lax`;

                            if (newRefresh) {
                                localStorage.setItem('refresh_token', newRefresh);
                                document.cookie = `refresh_token=${newRefresh}; path=/; max-age=604800; SameSite=Lax`;
                            }

                            if (data.user) {
                                localStorage.setItem('auth_user', JSON.stringify(data.user));
                            }

                            // Retry original request recursively
                            return apiRequest<T>(endpoint, options);
                        }
                    } else {
                        console.error('Refresh response was not OK:', refreshResponse.status);
                    }
                } catch (refreshErr) {
                    console.error('Failed to refresh token:', refreshErr);
                }
            }

            // If we reach here, either no refresh token or refresh failed
            if (typeof window !== 'undefined') {
                console.warn('Session recovery failed. Clearing session and redirecting.');
                localStorage.removeItem('auth_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('auth_user');
                document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                window.location.href = '/?session=expired';
            }
            throw new Error('Session expired. Please log in again.');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            let errorMessage = errorData.message || `API Request failed with status ${response.status}`;

            // Handle array of error messages (common in validation errors)
            if (Array.isArray(errorData.message)) {
                errorMessage = errorData.message.join(', ');
            }

            throw new Error(errorMessage);
        }

        // For 204 No Content
        if (response.status === 204) {
            return {} as T;
        }

        return await response.json();
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

export const api = {
    get: <T>(endpoint: string, options?: RequestOptions) =>
        apiRequest<T>(endpoint, { ...options, method: 'GET' }),

    post: <T>(endpoint: string, body: any, options?: RequestOptions) =>
        apiRequest<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),

    put: <T>(endpoint: string, body: any, options?: RequestOptions) =>
        apiRequest<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),

    patch: <T>(endpoint: string, body: any, options?: RequestOptions) =>
        apiRequest<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),

    delete: <T>(endpoint: string, options?: RequestOptions) =>
        apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};
