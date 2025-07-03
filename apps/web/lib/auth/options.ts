import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    // TODO: Replace with actual database lookup
                    // For now, return a mock user for testing
                    const mockUser = {
                        id: "1",
                        email: credentials.email,
                        firstName: "Test",
                        lastName: "User",
                        passwordHash: "$2a$10$example.hash", // Replace with actual hash
                        organizationId: "org-1"
                    };

                    // In production, you would:
                    // 1. Look up user by email in your database
                    // 2. Compare the password hash
                    // 3. Return user data if valid

                    if (credentials.email === "test@example.com" && credentials.password === "password") {
                        return {
                            id: mockUser.id,
                            email: mockUser.email,
                            name: `${mockUser.firstName} ${mockUser.lastName}`,
                            organizationId: mockUser.organizationId,
                        };
                    }

                    return null;
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            }
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    pages: {
        signIn: "/auth",
        error: "/auth/error",
    },
    callbacks: {
        async jwt({ token, user }) {
            // Persist the organizationId to the token right after signin
            if (user) {
                token.organizationId = user.organizationId;
            }
            return token;
        },
        async session({ session, token }) {
            // Send properties to the client
            if (token && session.user) {
                session.user.id = token.sub!;
                session.user.organizationId = token.organizationId;
            }
            return session;
        },
    },
    events: {
        async signIn(message) {
            // Update last login timestamp
            console.log("User signed in:", message.user.email);
            // TODO: Update database with last login timestamp
        },
    },
}; 