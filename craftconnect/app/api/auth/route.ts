import { NextRequest, NextResponse } from 'next/server';
import { generateSecureToken } from '../../../lib/auth-utils';

const CORRECT_PASSWORD = 'abracadabra';

export async function POST(request: NextRequest) {
    try {
        const { password } = await request.json();
        
        if (!password) {
            return NextResponse.json(
                { message: 'Password is required' },
                { status: 400 }
            );
        }
        
        if (password === CORRECT_PASSWORD) {
            // Generate secure token
            const secureToken = await generateSecureToken();
            
            // Create response with authentication cookie
            const response = NextResponse.json(
                { message: 'Authentication successful' },
                { status: 200 }
            );
            
            // Set authentication cookie with secure token
            response.cookies.set('qr-auth', secureToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24, // 24 hours
                path: '/'
            });
            
            return response;
        } else {
            return NextResponse.json(
                { message: 'Incorrect password. Try the magic word!' },
                { status: 401 }
            );
        }
    } catch (error) {
        console.error('Authentication error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
