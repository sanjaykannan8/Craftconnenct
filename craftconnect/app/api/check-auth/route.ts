import { NextRequest, NextResponse } from 'next/server';
import { verifySecureToken } from '../../../lib/auth-utils';

export async function GET(request: NextRequest) {
    try {
        const authToken = request.cookies.get('qr-auth')?.value;
        const isAuthenticated = authToken ? await verifySecureToken(authToken) : false;
        
        if (isAuthenticated) {
            return NextResponse.json(
                { authenticated: true },
                { status: 200 }
            );
        } else {
            // Clear invalid/expired token
            const response = NextResponse.json(
                { authenticated: false },
                { status: 401 }
            );
            response.cookies.delete('qr-auth');
            return response;
        }
    } catch (error) {
        console.error('Check auth error:', error);
        return NextResponse.json(
            { authenticated: false },
            { status: 500 }
        );
    }
}
