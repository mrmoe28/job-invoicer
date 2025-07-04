'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Simple user interface
interface User {
    id: string;
    email: string;
    displayName: string;
    isAuthenticated: boolean;
}

// Auth context interface
interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    signup: (email: string, password: string, displayName: string) => Promise<boolean>;
    logout: () => void;
    isLoading: boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user database (in real app, this would be in a database)
const MOCK_USERS = [
    {
        id: '1',
        email: 'demo@jobinvoicer.com',
        password: 'password123',
        displayName: 'Demo User'
    },
    {
        id: '2',
        email: 'admin@jobinvoicer.com',
        password: 'admin123',
        displayName: 'Admin User'
    }
];

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Check for existing session on mount
    useEffect(() => {
        const savedUser = localStorage.getItem('fallback_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const foundUser = MOCK_USERS.find(u => u.email === email && u.password === password);

        if (foundUser) {
            const authUser: User = {
                id: foundUser.id,
                email: foundUser.email,
                displayName: foundUser.displayName,
                isAuthenticated: true
            };

            setUser(authUser);
            localStorage.setItem('fallback_user', JSON.stringify(authUser));
            setIsLoading(false);
            return true;
        }

        setIsLoading(false);
        return false;
    };

    const signup = async (email: string, password: string, displayName: string): Promise<boolean> => {
        setIsLoading(true);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check if user already exists
        const existingUser = MOCK_USERS.find(u => u.email === email);
        if (existingUser) {
            setIsLoading(false);
            return false;
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            email,
            password,
            displayName
        };

        MOCK_USERS.push(newUser);

        const authUser: User = {
            id: newUser.id,
            email: newUser.email,
            displayName: newUser.displayName,
            isAuthenticated: true
        };

        setUser(authUser);
        localStorage.setItem('fallback_user', JSON.stringify(authUser));
        setIsLoading(false);
        return true;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('fallback_user');
        router.push('/login');
    };

    const value: AuthContextType = {
        user,
        login,
        signup,
        logout,
        isLoading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to use auth context
export function useAuthFallback() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthFallback must be used within an AuthProvider');
    }
    return context;
}

// HOC to protect routes
export function withAuth<T extends object>(Component: React.ComponentType<T>) {
    return function ProtectedRoute(props: T) {
        const { user, isLoading } = useAuthFallback();
        const router = useRouter();

        useEffect(() => {
            if (!isLoading && !user) {
                router.push('/login?returnUrl=' + encodeURIComponent(window.location.pathname));
            }
        }, [user, isLoading, router]);

        if (isLoading) {
            return (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Loading...</p>
                    </div>
                </div>
            );
        }

        if (!user) {
            return null;
        }

        return <Component {...props} />;
    };
} 