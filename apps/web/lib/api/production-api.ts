import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { pbkdf2Sync, randomBytes } from 'crypto';

// Simple in-memory storage for now - will be replaced with real DB later
const users = new Map<string, any>();
const organizations = new Map<string, any>();
const verificationTokens = new Map<string, any>();

// Mock email function - will be replaced with real email service
async function sendVerificationEmail({ email, firstName, verificationUrl }: { email: string; firstName: string; verificationUrl: string }) {
    console.log(`Mock: Sending verification email to ${email} (${firstName}) with URL: ${verificationUrl}`);
    return { success: true };
}

const t = initTRPC.create();

export const appRouter = t.router({
    // Test endpoint
    hello: t.procedure
        .input(z.object({ name: z.string() }))
        .query(({ input }) => {
            return { greeting: `Hello ${input.name}!` };
        }),

    // User registration
    register: t.procedure
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
                const existingUser = Array.from(users.values()).find(
                    (user: any) => user.email === input.email
                );

                if (existingUser) {
                    throw new TRPCError({
                        code: 'CONFLICT',
                        message: 'User already exists with this email'
                    });
                }

                // Hash password
                const salt = randomBytes(16).toString('hex');
                const hashedPassword = pbkdf2Sync(input.password, salt, 1000, 64, 'sha512').toString('hex');

                // Create organization first
                const orgId = randomBytes(16).toString('hex');
                const organization = {
                    id: orgId,
                    name: input.organizationName,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                organizations.set(orgId, organization);

                // Create user
                const userId = randomBytes(16).toString('hex');
                const user = {
                    id: userId,
                    email: input.email,
                    passwordHash: hashedPassword,
                    passwordSalt: salt,
                    firstName: input.firstName,
                    lastName: input.lastName,
                    organizationId: orgId,
                    emailVerified: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                users.set(userId, user);

                // Generate verification token
                const verificationToken = randomBytes(32).toString('hex');
                const expiresAt = new Date();
                expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours from now

                verificationTokens.set(verificationToken, {
                    userId: userId,
                    token: verificationToken,
                    type: 'email_verification',
                    expiresAt,
                    createdAt: new Date(),
                });

                // Send verification email
                try {
                    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3010'}/verify-email?token=${verificationToken}`;
                    await sendVerificationEmail({
                        email: user.email,
                        firstName: user.firstName,
                        verificationUrl
                    });
                } catch (emailError) {
                    console.error('Failed to send verification email:', emailError);
                    // Don't fail registration if email sending fails
                }

                return {
                    success: true,
                    message: 'User registered successfully. Please check your email for verification.',
                    userId: user.id,
                    requiresVerification: true
                };
            } catch (error) {
                console.error('Registration error:', error);
                if (error instanceof TRPCError) {
                    throw error;
                }
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to register user'
                });
            }
        }),

    // Email verification
    verifyEmail: t.procedure
        .input(z.object({
            token: z.string(),
        }))
        .mutation(async ({ input }) => {
            try {
                // Find verification token
                const tokenRecord = verificationTokens.get(input.token);

                if (!tokenRecord || tokenRecord.type !== 'email_verification') {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'Invalid verification token'
                    });
                }

                // Check if token is expired
                if (tokenRecord.expiresAt < new Date()) {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: 'Verification token has expired'
                    });
                }

                // Update user as verified
                const user = users.get(tokenRecord.userId);
                if (user) {
                    user.emailVerified = true;
                    user.updatedAt = new Date();
                    users.set(user.id, user);
                }

                // Delete used token
                verificationTokens.delete(input.token);

                return {
                    success: true,
                    message: 'Email verified successfully'
                };
            } catch (error) {
                console.error('Email verification error:', error);
                if (error instanceof TRPCError) {
                    throw error;
                }
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to verify email'
                });
            }
        }),

    // User login
    login: t.procedure
        .input(z.object({
            email: z.string().email(),
            password: z.string(),
        }))
        .mutation(async ({ input }) => {
            try {
                // Find user
                const user = Array.from(users.values()).find(
                    (u: any) => u.email === input.email
                );

                if (!user) {
                    throw new TRPCError({
                        code: 'UNAUTHORIZED',
                        message: 'Invalid email or password'
                    });
                }

                // Check password
                const hashedPassword = pbkdf2Sync(input.password, user.passwordSalt, 1000, 64, 'sha512').toString('hex');
                if (hashedPassword !== user.passwordHash) {
                    throw new TRPCError({
                        code: 'UNAUTHORIZED',
                        message: 'Invalid email or password'
                    });
                }

                // Check if email is verified
                if (!user.emailVerified) {
                    throw new TRPCError({
                        code: 'FORBIDDEN',
                        message: 'Please verify your email before logging in'
                    });
                }

                // Get organization
                const organization = organizations.get(user.organizationId);

                return {
                    success: true,
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        organization: organization
                    }
                };
            } catch (error) {
                console.error('Login error:', error);
                if (error instanceof TRPCError) {
                    throw error;
                }
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to login'
                });
            }
        }),

    // Get companies
    getCompanies: t.procedure
        .query(async () => {
            try {
                const companies = Array.from(organizations.values());
                return companies;
            } catch (error) {
                console.error('Get companies error:', error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to fetch companies'
                });
            }
        }),

    // Create company
    createCompany: t.procedure
        .input(z.object({
            name: z.string().min(1),
            description: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
            try {
                const companyId = randomBytes(16).toString('hex');
                const company = {
                    id: companyId,
                    name: input.name,
                    description: input.description,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                organizations.set(companyId, company);

                return company;
            } catch (error) {
                console.error('Create company error:', error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to create company'
                });
            }
        }),

    // Update company
    updateCompany: t.procedure
        .input(z.object({
            id: z.string(),
            name: z.string().min(1),
            description: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
            try {
                const company = organizations.get(input.id);
                if (!company) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'Company not found'
                    });
                }

                company.name = input.name;
                company.description = input.description;
                company.updatedAt = new Date();
                organizations.set(input.id, company);

                return company;
            } catch (error) {
                console.error('Update company error:', error);
                if (error instanceof TRPCError) {
                    throw error;
                }
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to update company'
                });
            }
        }),

    // Delete company
    deleteCompany: t.procedure
        .input(z.object({
            id: z.string(),
        }))
        .mutation(async ({ input }) => {
            try {
                const company = organizations.get(input.id);
                if (!company) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'Company not found'
                    });
                }

                organizations.delete(input.id);
                return { success: true };
            } catch (error) {
                console.error('Delete company error:', error);
                if (error instanceof TRPCError) {
                    throw error;
                }
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to delete company'
                });
            }
        }),
});

export type AppRouter = typeof appRouter;
