import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;
    const { pathname } = request.nextUrl;

    console.log(`Middleware tracing: ${pathname}, token present: ${!!token}`);

    // Public routes that don't need authentication
    const publicRoutes = ['/', '/signup', '/forgot-password'];

    const isPublicRoute = publicRoutes.includes(pathname);

    // If the user is unauthenticated and trying to access a protected route
    if (!token && !isPublicRoute) {
        // Redirect to signin (now at root)
        return NextResponse.redirect(new URL('/', request.url));
    }

    // If the user is authenticated and trying to access an auth route (like login or signup)
    if (token && isPublicRoute) {
        // Redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

// Config to match all routes except static files and api routes
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|images|favicon.ico).*)',
    ],
};
