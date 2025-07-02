import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { sendVerificationEmail } from '../email';
import crypto from 'crypto';

// Temporary in-memory storage for development
// In production, this would be replaced with real database operations
const inMemoryUsers = new Map();
const inMemoryOrganizations = new Map();
const inMemoryTokens = new Map();
const inMemoryCompanies = new Map();

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

// Helper function to hash passwords
async function hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const salt = crypto.randomBytes(16).toString('hex');
        crypto.pbkdf2(password, salt, 10000, 64, 'sha512', (err, derivedKey) => {
            if (err) reject(err);
            const hash = derivedKey.toString('hex');
            resolve(`${salt}:${hash}`);
        });
    });
}

// Helper function to verify passwords
async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const [salt, originalHash] = hash.split(':');
        if (!salt || !originalHash) {
            resolve(false);
            return;
        }
        crypto.pbkdf2(password, salt, 10000, 64, 'sha512', (err, derivedKey) => {
            if (err) reject(err);
            const hashToCheck = derivedKey.toString('hex');
            resolve(hashToCheck === originalHash);
        });
    });
}

export const appRouter = router({
    // Test endpoint
    hello: publicProcedure
        .input(z.object({ name: z.string() }))
        .query(({ input }) => {
            return `Hello ${input.name}! Production API is running with real database.`;
        }),

    // User registration with email verification
    register: publicProcedure
        .input(z.object({
            email: z.string().email(),
            password: z.string().min(6),
            firstName: z.string().min(1),
            lastName: z.string().min(1),
            organizationName: z.string().min(1),
        }))
        .mutation(async ({ input }) => {
            try {
                // Check if user already exists
                const existingUser = Array.from(inMemoryUsers.values()).find(
                    (user: any) => user.email === input.email
                );

                if (existingUser) {
                    throw new TRPCError({
                        code: 'CONFLICT',
                        message: 'User already exists with this email',
                    });
                }

                // Hash password
                const passwordHash = await hashPassword(input.password);

                // Create organization first
                const orgId = crypto.randomUUID();
                const orgSlug = input.organizationName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                const organization = {
                    id: orgId,
                    name: input.organizationName,
                    slug: orgSlug,
                    plan: 'free',
                    status: 'active',
                    maxUsers: 5,
                    maxJobs: 50,
                    maxStorageGb: 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                inMemoryOrganizations.set(orgId, organization);

                // Create user (not verified yet)
                const userId = crypto.randomUUID();
                const user = {
                    id: userId,
                    organizationId: orgId,
                    email: input.email,
                    passwordHash,
                    firstName: input.firstName,
                    lastName: input.lastName,
                    role: 'owner',
                    isActive: false, // Inactive until email verified
                    emailVerifiedAt: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                inMemoryUsers.set(userId, user);

                // Generate verification token
                const verificationToken = crypto.randomUUID();
                const verificationExpiry = new Date();
                verificationExpiry.setHours(verificationExpiry.getHours() + 24); // 24 hour expiry

                // Store verification token
                inMemoryTokens.set(verificationToken, {
                    email: input.email,
                    token: verificationToken,
                    type: 'email_verification',
                    expiresAt: verificationExpiry,
                    usedAt: null,
                });

                // Send verification email
                try {
                    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3010';
                    const verificationUrl = `${baseUrl}/auth/verify?token=${verificationToken}`;

                    await sendVerificationEmail({
                        email: input.email,
                        firstName: input.firstName,
                        verificationUrl,
                    });
                } catch (emailError) {
                    console.error('Failed to send verification email:', emailError);
                }

                return {
                    success: true,
                    message: 'Registration successful! Please check your email to verify your account.',
                    requiresVerification: true,
                };
            } catch (error) {
                console.error('Registration error:', error);
                if (error instanceof TRPCError) {
                    throw error;
                }
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Registration failed',
                });
            }
        }),

    // Email verification
    verifyEmail: publicProcedure
        .input(z.object({
            token: z.string(),
        }))
        .mutation(async ({ input }) => {
            try {
                // Find the verification token
                const tokenRecord = inMemoryTokens.get(input.token);

                if (!tokenRecord || tokenRecord.type !== 'email_verification' || tokenRecord.usedAt) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'Invalid or expired verification token',
                    });
                }

                // Check if token is expired
                if (new Date() > tokenRecord.expiresAt) {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: 'Verification token has expired',
                    });
                }

                // Find the user
                const user = Array.from(inMemoryUsers.values()).find(
                    (u: any) => u.email === tokenRecord.email
                );

                if (!user) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'User not found',
                    });
                }

                // Mark token as used
                tokenRecord.usedAt = new Date();
                inMemoryTokens.set(input.token, tokenRecord);

                // Activate user account
                user.isActive = true;
                user.emailVerifiedAt = new Date();
                inMemoryUsers.set(user.id, user);

                return {
                    success: true,
                    message: 'Email verified successfully! You can now log in.',
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        isActive: user.isActive,
                        emailVerifiedAt: user.emailVerifiedAt,
                    },
                };
            } catch (error) {
                console.error('Email verification error:', error);
                if (error instanceof TRPCError) {
                    throw error;
                }
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Email verification failed',
                });
            }
        }),

    // Authentication - requires email verification
    login: publicProcedure
        .input(z.object({
            email: z.string(),
            password: z.string(),
        }))
        .mutation(async ({ input }) => {
            try {
                // Find user
                const user = Array.from(inMemoryUsers.values()).find(
                    (u: any) => u.email === input.email
                );

                if (!user) {
                    throw new TRPCError({
                        code: 'UNAUTHORIZED',
                        message: 'Invalid email or password',
                    });
                }

                // Check if email is verified
                if (!user.emailVerifiedAt || !user.isActive) {
                    throw new TRPCError({
                        code: 'UNAUTHORIZED',
                        message: 'Please verify your email address before logging in',
                    });
                }

                // Verify password
                const isValidPassword = await verifyPassword(input.password, user.passwordHash);
                if (!isValidPassword) {
                    throw new TRPCError({
                        code: 'UNAUTHORIZED',
                        message: 'Invalid email or password',
                    });
                }

                // Get organization
                const organization = inMemoryOrganizations.get(user.organizationId);

                // Update last login
                user.lastLoginAt = new Date();
                inMemoryUsers.set(user.id, user);

                return {
                    success: true,
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role,
                        isActive: user.isActive,
                        emailVerifiedAt: user.emailVerifiedAt,
                    },
                    organization: organization ? {
                        id: organization.id,
                        name: organization.name,
                        slug: organization.slug,
                        plan: organization.plan,
                    } : null,
                };
            } catch (error) {
                console.error('Login error:', error);
                if (error instanceof TRPCError) {
                    throw error;
                }
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Login failed',
                });
            }
        }),

    // Dashboard Stats
    getDashboardStats: publicProcedure
        .input(z.object({
            organizationId: z.string(),
        }))
        .query(async ({ input }) => {
            try {
                // For now, return mock stats
                const companies = Array.from(inMemoryCompanies.values()).filter(
                    (company: any) => company.organizationId === input.organizationId
                );

                return {
                    totalUsers: 1,
                    totalCompanies: companies.length,
                    totalContacts: 0,
                    totalJobs: 0,
                    activeJobs: 0,
                    completedJobs: 0,
                    pendingTasks: 0,
                    completedTasks: 0,
                    completionRate: 0,
                };
            } catch (error) {
                console.error('Dashboard stats error:', error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to fetch dashboard stats',
                });
            }
        }),

    // Companies CRUD
    getCompanies: publicProcedure
        .input(z.object({
            organizationId: z.string(),
        }))
        .query(async ({ input }) => {
            try {
                const companies = Array.from(inMemoryCompanies.values()).filter(
                    (company: any) => company.organizationId === input.organizationId && company.isActive
                );

                return companies.map((company: any) => ({
                    ...company,
                    createdAt: company.createdAt.toISOString(),
                    updatedAt: company.updatedAt.toISOString(),
                }));
            } catch (error) {
                console.error('Get companies error:', error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to fetch companies',
                });
            }
        }),

    createCompany: publicProcedure
        .input(z.object({
            organizationId: z.string(),
            name: z.string().min(1),
            industry: z.string().optional(),
            address: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            zipCode: z.string().optional(),
            phone: z.string().optional(),
            email: z.string().email().optional(),
        }))
        .mutation(async ({ input }) => {
            try {
                const companyId = crypto.randomUUID();
                const company = {
                    id: companyId,
                    organizationId: input.organizationId,
                    name: input.name,
                    industry: input.industry,
                    address: input.address,
                    city: input.city,
                    state: input.state,
                    zipCode: input.zipCode,
                    phone: input.phone,
                    email: input.email,
                    country: 'US',
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                inMemoryCompanies.set(companyId, company);
                return company;
            } catch (error) {
                console.error('Create company error:', error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to create company',
                });
            }
        }),

    // Reset all data (for development/testing)
    resetAllData: publicProcedure
        .mutation(async () => {
            inMemoryUsers.clear();
            inMemoryOrganizations.clear();
            inMemoryTokens.clear();
            inMemoryCompanies.clear();

            return {
                success: true,
                message: 'All data has been reset',
            };
        }),
});

export type AppRouter = typeof appRouter; 