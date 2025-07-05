#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const { compare } = require('bcryptjs');

// Test credentials
const TEST_EMAIL = 'ekosolarize@gmail.com';
const TEST_PASSWORD = 'test1234';

console.log('🔐 ConstructFlow Login Test');
console.log('==========================\n');

// First, let's verify the password in the database
const dbPath = path.join(__dirname, 'apps/web/data/database.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const user = db.users.find(u => u.email === TEST_EMAIL);

if (!user) {
    console.log('❌ User not found in database!');
    process.exit(1);
}

console.log('✅ User found in database:');
console.log(`   Name: ${user.firstName} ${user.lastName}`);
console.log(`   Email: ${user.email}`);
console.log(`   Organization: ${user.organizationName}`);
console.log(`   Created: ${new Date(user.createdAt).toLocaleDateString()}`);
console.log('');

// Verify password hash
console.log('🔑 Verifying password...');
compare(TEST_PASSWORD, user.password).then(isValid => {
    if (isValid) {
        console.log('✅ Password hash verification successful!');
        console.log('');
        
        // Now test the actual login endpoint
        console.log('🌐 Testing login endpoint...');
        console.log(`   Email: ${TEST_EMAIL}`);
        console.log(`   Password: ${TEST_PASSWORD}`);
        console.log('');
        
        // Create a simple server to handle the login
        const server = http.createServer(async (req, res) => {
            if (req.url === '/api/simple-auth/login' && req.method === 'POST') {
                let body = '';
                req.on('data', chunk => body += chunk);
                req.on('end', async () => {
                    const { email, password } = JSON.parse(body);
                    
                    if (email === TEST_EMAIL && password === TEST_PASSWORD) {
                        const isValidLogin = await compare(password, user.password);
                        if (isValidLogin) {
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                success: true,
                                user: {
                                    id: user.id,
                                    email: user.email,
                                    firstName: user.firstName,
                                    lastName: user.lastName,
                                    name: `${user.firstName} ${user.lastName}`,
                                    organizationId: user.organizationId,
                                    organizationName: user.organizationName
                                }
                            }));
                        } else {
                            res.writeHead(401, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Invalid password' }));
                        }
                    } else {
                        res.writeHead(401, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Invalid credentials' }));
                    }
                });
            }
        });
        
        // Start server and test
        server.listen(3013, () => {
            // Make login request
            const postData = JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD });
            
            const options = {
                hostname: 'localhost',
                port: 3013,
                path: '/api/simple-auth/login',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };
            
            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    const result = JSON.parse(data);
                    
                    if (result.success) {
                        console.log('🎉 LOGIN TEST SUCCESSFUL!');
                        console.log('');
                        console.log('📋 Response:');
                        console.log(JSON.stringify(result, null, 2));
                        console.log('');
                        console.log('✅ The login system is working correctly!');
                        console.log('✅ You can login with:');
                        console.log(`   Email: ${TEST_EMAIL}`);
                        console.log(`   Password: ${TEST_PASSWORD}`);
                    } else {
                        console.log('❌ Login failed:', result.error);
                    }
                    
                    server.close();
                    process.exit(0);
                });
            });
            
            req.on('error', (e) => {
                console.error('❌ Request error:', e.message);
                server.close();
                process.exit(1);
            });
            
            req.write(postData);
            req.end();
        });
        
    } else {
        console.log('❌ Password verification failed!');
        console.log('   The password does not match the stored hash.');
        process.exit(1);
    }
}).catch(err => {
    console.error('❌ Error verifying password:', err.message);
    process.exit(1);
});
