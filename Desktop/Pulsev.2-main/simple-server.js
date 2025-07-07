#!/usr/bin/env node

// Simple server to test the authentication flow
const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { compare } = require('bcryptjs');

const PORT = 3012;
const DB_PATH = path.join(__dirname, 'apps/web/data/database.json');

// Helper to read database
async function readDatabase() {
    const data = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(data);
}

// Helper to parse JSON body
function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (e) {
                resolve({});
            }
        });
    });
}

// Create server
const server = http.createServer(async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Handle login endpoint
    if (req.url === '/api/simple-auth/login' && req.method === 'POST') {
        try {
            const { email, password } = await parseBody(req);
            
            console.log('Login attempt:', email);
            
            if (!email || !password) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Email and password required' }));
                return;
            }
            
            const db = await readDatabase();
            const user = db.users.find(u => u.email === email);
            
            if (!user) {
                console.log('User not found:', email);
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid email or password' }));
                return;
            }
            
            const isValid = await compare(password, user.password);
            
            if (!isValid) {
                console.log('Invalid password for:', email);
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid email or password' }));
                return;
            }
            
            console.log('Login successful for:', email);
            
            const { password: _, ...userWithoutPassword } = user;
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                user: {
                    ...userWithoutPassword,
                    name: `${user.firstName} ${user.lastName}`
                }
            }));
            
        } catch (error) {
            console.error('Login error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
        return;
    }
    
    // Handle GET /api/users
    if (req.url === '/api/users' && req.method === 'GET') {
        try {
            const db = await readDatabase();
            const users = db.users.map(u => ({
                email: u.email,
                firstName: u.firstName,
                lastName: u.lastName,
                organizationName: u.organizationName,
                createdAt: u.createdAt
            }));
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(users));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to load users' }));
        }
        return;
    }
    
    // Default response
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
});

// Start server
server.listen(PORT, () => {
    console.log(`\n🚀 Test server running on http://localhost:${PORT}`);
    console.log('\nAvailable endpoints:');
    console.log('- POST /api/simple-auth/login - Test login');
    console.log('- GET /api/users - List all users');
    console.log('\nPress Ctrl+C to stop\n');
});
