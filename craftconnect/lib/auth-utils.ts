const SECRET_KEY = process.env.AUTH_SECRET || 'your-super-secret-key-change-this-in-production';

// Convert string to ArrayBuffer
function stringToArrayBuffer(str: string): ArrayBuffer {
    const encoder = new TextEncoder();
    return encoder.encode(str).buffer;
}

// Convert ArrayBuffer to hex string
function arrayBufferToHex(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate random hex string (replacement for randomBytes)
function generateRandomHex(length: number): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return arrayBufferToHex(array.buffer);
}

// Create HMAC signature using Web Crypto API
async function createHmacSignature(message: string, secret: string): Promise<string> {
    const key = await crypto.subtle.importKey(
        'raw',
        stringToArrayBuffer(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    
    const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        stringToArrayBuffer(message)
    );
    
    return arrayBufferToHex(signature);
}

// Generate a secure token with HMAC signature
export async function generateSecureToken(): Promise<string> {
    const timestamp = Date.now().toString();
    const nonce = generateRandomHex(16);
    const payload = `${timestamp}:${nonce}`;
    const signature = await createHmacSignature(payload, SECRET_KEY);
    return `${payload}:${signature}`;
}

// Verify the secure token
export async function verifySecureToken(token: string): Promise<boolean> {
    try {
        const parts = token.split(':');
        if (parts.length !== 3) return false;
        
        const [timestamp, nonce, signature] = parts;
        const payload = `${timestamp}:${nonce}`;
        const expectedSignature = await createHmacSignature(payload, SECRET_KEY);
        
        // Check signature
        if (signature !== expectedSignature) return false;
        
        // Check if token is expired (24 hours)
        const tokenTime = parseInt(timestamp);
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        
        return (now - tokenTime) < maxAge;
    } catch (error) {
        return false;
    }
}
