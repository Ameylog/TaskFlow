import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_EXPIRES_IN = `${process.env.JWT_EXPIRES_IN || '15'}m`;

export function generateToken(user: { userId: number; role: string; name: string }) {
    return jwt.sign(
        { userId: user.userId, role: user.role, name: user.name }, 
        JWT_SECRET, 
        { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );
}

export function verifyToken(token: string): { userId: number; role: string; name: string } | null {
    try {
        return jwt.verify(token, JWT_SECRET) as { userId: number; role: string; name: string };
    } catch {
        return null;
    }
}

