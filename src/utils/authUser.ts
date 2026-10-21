// Reads the current user's identity for client-side display/gating
// decisions (e.g. hiding a button, showing an access-restricted message).
// The JWT payload is the source of truth for role, merged over whatever
// /users/:id profile was cached at login. This is a UX convenience only —
// every action it gates is independently enforced by the backend.
export function getAuthUser(): any {
    try {
        const authUserJson = localStorage.getItem("auth_user") || localStorage.getItem("user");
        const authToken = localStorage.getItem("auth_token");

        let user: any = authUserJson ? JSON.parse(authUserJson) : {};

        if (authToken) {
            try {
                const payload = JSON.parse(atob(authToken.split(".")[1]));
                user = { ...user, ...payload };
            } catch {
                /* ignore malformed token */
            }
        }

        return user;
    } catch {
        return {};
    }
}

export function hasRole(user: any, roles: string[]): boolean {
    const role = (user?.role || "").toLowerCase();
    return roles.some((r) => role === r.toLowerCase() || role.includes(r.toLowerCase()));
}
