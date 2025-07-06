import { NextRequest, NextResponse } from "next/server";
import { validateUserPassword } from "../../../../lib/database-postgres";

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        console.log('Login attempt:', { email, passwordLength: password?.length });

        if (!email || !password) {
            console.log('Missing email or password');
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        // Validate user credentials using database
        const user = await validateUserPassword(email, password);

        if (!user) {
            console.log('Invalid credentials for email:', email);
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        console.log('Login successful for user:', user.email);

        // Return user data (password already excluded by validateUserPassword)
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
        console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
        console.error("Environment:", {
            isVercel: process.env.VERCEL === '1',
            nodeEnv: process.env.NODE_ENV,
            platform: process.platform
        });

        return NextResponse.json(
            {
                error: "Internal server error",
                details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
            },
            { status: 500 }
        );
    }
} 