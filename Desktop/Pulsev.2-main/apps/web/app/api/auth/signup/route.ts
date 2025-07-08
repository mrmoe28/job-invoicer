import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { neon } from '@neondatabase/serverless';

const getDatabaseClient = () => {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }
  return neon(DATABASE_URL);
};

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, organizationName, businessType } = await request.json();

    // Validate input
    if (!email || !password || !firstName || !lastName || !organizationName) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    const client = getDatabaseClient();

    // Check if user already exists
    const existingUsers = await client`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hash(password, 12);

    // Create organization first
    const organizations = await client`
      INSERT INTO organizations (
        id,
        name,
        slug,
        business_type,
        plan,
        status,
        max_users,
        max_customers,
        max_contractors
      ) VALUES (
        gen_random_uuid(),
        ${organizationName},
        ${organizationName.toLowerCase().replace(/[^a-z0-9]/g, '-')},
        ${businessType || 'solar_contractor'},
        'starter',
        'active',
        10,
        500,
        50
      )
      RETURNING id, name, slug
    `;

    const organization = organizations[0];

    // Create user
    const users = await client`
      INSERT INTO users (
        id,
        organization_id,
        email,
        password_hash,
        first_name,
        last_name,
        role,
        is_active,
        email_verified_at
      ) VALUES (
        gen_random_uuid(),
        ${organization.id},
        ${email},
        ${passwordHash},
        ${firstName},
        ${lastName},
        'owner',
        true,
        NOW()
      )
      RETURNING id, email, first_name, last_name, role
    `;

    const user = users[0];

    console.log(`✅ Production account created: ${email} for ${organizationName}`);

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        organizationId: organization.id,
        organizationName: organization.name,
      }
    });

  } catch (error) {
    console.error("❌ Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}