import { NextRequest, NextResponse } from 'next/server';
import { Role } from '@/interfaces/enums';

const protectedPaths = [
    '/dashboard',
    '/dashboard/clients',
    '/dashboard/inventory',
    '/dashboard/messages',
    '/dashboard/orders',
    '/dashboard/reports',
    '/dashboard/settings',
    '/dashboard/stores',
    '/dashboard/suppliers',
    '/dashboard/supplies',
]

const adminOnlyPaths = [
    '/dashboard/users'
]

export const middleware = (request: NextRequest) =>
{
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('authToken')?.value;

    const isProtected = protectedPaths.some(path => pathname.startsWith(path));
    const isAdminOnly = adminOnlyPaths.some(path => pathname.startsWith(path));

    if (isProtected || isAdminOnly)
    {
        if (!token) return NextResponse.redirect(new URL('/signin', request.url));

        if (isAdminOnly)
        {
            try
            {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.role !== Role.ADMIN) return NextResponse.redirect(new URL('/unauthorized', request.url));
            }
            catch (e)
            {
                return NextResponse.redirect(new URL('/signin', request.url));
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|signin|signup|$).*)',
    ]
}