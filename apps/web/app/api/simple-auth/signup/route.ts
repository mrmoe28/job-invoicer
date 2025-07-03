import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

// Simple in-memory storage (shared with login)
const users: any[] = [];
const organizations: any[] = [];

export async function POST(request: NextRequest) {
    try {
        const { email, password, firstName, lastName, organizationName } = await request.json();

        if (!email || !password || !firstName || !lastName || !organizationName) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 400 }
            );
        }

        // Hash password
        const passwordHash = await hash(password, 12);

        // Create organization
        const organizationId = `org-${Date.now()}`;
        const organization = {
            id: organizationId,
            name: organizationName,
            slug: organizationName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            plan: 'free',
            createdAt: new Date(),
        };
        organizations.push(organization);

        // Create user
        const userId = `user-${Date.now()}`;
        const user = {
            id: userId,
            email,
            password: passwordHash,
            firstName,
            lastName,
            organizationId,
            organizationName,
            role: 'owner',
            createdAt: new Date(),
        };
        users.push(user);

        // Return success (without password)
        return NextResponse.json({
            success: true,
            message: "Account created successfully",
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                name: `${user.firstName} ${user.lastName}`,
                organizationId: user.organizationId,
                organizationName: user.organizationName,
                role: user.role,
            }
        });

    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
} 