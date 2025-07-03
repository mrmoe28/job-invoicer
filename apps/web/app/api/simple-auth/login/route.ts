import { compare } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

// Simple in-memory user storage (in production, this would be a database)
const users = [
    {
        id: "1",
        email: "test@example.com",
        password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj0kJFlzg.Ru", // "password"
        firstName: "Test",
        lastName: "User",
        organizationId: "org-1",
        organizationName: "Test Company"
    }
];

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        // Find user by email
        const user = users.find(u => u.email === email);

        if (!user) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        // Check password
        const isValid = await compare(password, user.password);

        if (!isValid) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        // Return user data (without password)
        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                name: `${user.firstName} ${user.lastName}`,
                organizationId: user.organizationId,
                organizationName: user.organizationName,
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
} 