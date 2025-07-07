// Test script to verify login functionality
const fetch = require('node-fetch');

async function testLoginAPI() {
    const testCases = [
        {
            email: 'ekosolarize@gmail.com',
            password: 'test1234',
            description: 'Valid credentials (after password reset)'
        },
        {
            email: 'ekosolarize@gmail.com',
            password: 'wrongpassword',
            description: 'Invalid password'
        },
        {
            email: 'nonexistent@example.com',
            password: 'test1234',
            description: 'Non-existent user'
        }
    ];
    
    console.log('Testing ConstructFlow Login API');
    console.log('================================\n');
    
    for (const testCase of testCases) {
        console.log(`Test: ${testCase.description}`);
        console.log(`Email: ${testCase.email}`);
        console.log(`Password: ${testCase.password}`);
        
        try {
            const response = await fetch('http://localhost:3010/api/simple-auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: testCase.email,
                    password: testCase.password
                })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                console.log('✅ Login successful!');
                console.log(`   User: ${data.user.firstName} ${data.user.lastName}`);
                console.log(`   Organization: ${data.user.organizationName}`);
            } else {
                console.log('❌ Login failed:', data.error || 'Unknown error');
            }
        } catch (error) {
            console.log('❌ Connection error:', error.message);
            console.log('   Make sure the server is running on port 3010');
        }
        
        console.log('\n' + '-'.repeat(50) + '\n');
    }
}

// Run the test
testLoginAPI().catch(console.error);
