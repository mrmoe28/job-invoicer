import { compare, hash } from 'bcryptjs';
import { promises as fs } from 'fs';
import path from 'path';

export interface User {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationId: string;
    organizationName: string;
    createdAt: string;
    updatedAt: string;
}

export interface Organization {
    id: string;
    name: string;
    slug?: string;
    createdAt: string;
    updatedAt: string;
}

interface Database {
    users: User[];
    organizations: Organization[];
}

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'database.json');

// Ensure data directory exists
async function ensureDataDir() {
    const dataDir = path.dirname(DB_FILE_PATH);
    try {
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir, { recursive: true });
    }
}

// Initialize database with clean data (no demo users)
async function initializeDatabase(): Promise<Database> {
    const defaultData: Database = {
        users: [],
        organizations: []
    };

    await ensureDataDir();
    await fs.writeFile(DB_FILE_PATH, JSON.stringify(defaultData, null, 2));
    console.log('Database initialized with clean data');
    return defaultData;
}

// Read database
async function readDatabase(): Promise<Database> {
    try {
        await ensureDataDir();
        const data = await fs.readFile(DB_FILE_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.log('Database file not found, initializing clean database...');
        return await initializeDatabase();
    }
}

// Write database
async function writeDatabase(data: Database): Promise<void> {
    await ensureDataDir();
    await fs.writeFile(DB_FILE_PATH, JSON.stringify(data, null, 2));
}

// Generate unique ID
function generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// User operations
export async function createUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName: string;
    organizationSlug?: string;
}): Promise<{ user: User; organization: Organization }> {
    const db = await readDatabase();

    // Check if user already exists
    const existingUser = db.users.find(u => u.email === userData.email);
    if (existingUser) {
        throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hash(userData.password, 12);

    // Create organization
    const organizationId = generateId();
    const organization: Organization = {
        id: organizationId,
        name: userData.organizationName,
        slug: userData.organizationSlug || userData.organizationName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    // Create user
    const userId = generateId();
    const user: User = {
        id: userId,
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        organizationId,
        organizationName: userData.organizationName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    // Add to database
    db.users.push(user);
    db.organizations.push(organization);

    await writeDatabase(db);

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return {
        user: userWithoutPassword as User,
        organization
    };
}

export async function findUserByEmail(email: string): Promise<User | null> {
    const db = await readDatabase();
    return db.users.find(u => u.email === email) || null;
}

export async function validateUserPassword(email: string, password: string): Promise<User | null> {
    const user = await findUserByEmail(email);
    if (!user) return null;

    const isValid = await compare(password, user.password);
    if (!isValid) return null;

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
}

export async function getAllUsers(): Promise<User[]> {
    const db = await readDatabase();
    return db.users.map(u => {
        const { password, ...userWithoutPassword } = u;
        return userWithoutPassword as User;
    });
}

export async function getUserById(id: string): Promise<User | null> {
    const db = await readDatabase();
    const user = db.users.find(u => u.id === id);
    if (!user) return null;

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
}

// Organization operations
export async function findOrganizationById(id: string): Promise<Organization | null> {
    const db = await readDatabase();
    return db.organizations.find(o => o.id === id) || null;
}

export async function getAllOrganizations(): Promise<Organization[]> {
    const db = await readDatabase();
    return db.organizations;
}

// Reset database (remove all users and organizations)
export async function resetDatabase(): Promise<void> {
    console.log('Resetting database - removing all users and organizations');
    await initializeDatabase();
} 