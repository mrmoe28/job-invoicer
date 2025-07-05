const express = require('express');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Path to database
const dbPath = path.join(__dirname, 'apps/web/data/database.json');

// Helper functions
function readDatabase() {
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

function writeDatabase(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// Login endpoint
app.post('/api/test-login', async (req, res) => {
    const { email, password } = req.body;
    
    console.log('Login attempt:', { email, passwordLength: password?.length });
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }
    
    const db = readDatabase();
    const user = db.users.find(u => u.email === email);
    
    if (!user) {
        console.log('User not found:', email);
        return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
        console.log('Invalid password for:', email);
        return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    console.log('Login successful for:', email);
    
    const { password: _, ...userWithoutPassword } = user;
    res.json({
        success: true,
        user: {
            ...userWithoutPassword,
            name: `${user.firstName} ${user.lastName}`
        }
    });
});

// List users endpoint (for debugging)
app.get('/api/users', (req, res) => {
    const db = readDatabase();
    const users = db.users.map(u => ({
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        organizationName: u.organizationName,
        createdAt: u.createdAt
    }));
    res.json(users);
});

// Reset password endpoint (for testing)
app.post('/api/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;
    
    const db = readDatabase();
    const userIndex = db.users.findIndex(u => u.email === email);
    
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    db.users[userIndex].password = hashedPassword;
    
    writeDatabase(db);
    
    res.json({ success: true, message: 'Password reset successfully' });
});

const PORT = 3011;
app.listen(PORT, () => {
    console.log(`Test server running on http://localhost:${PORT}`);
    console.log('');
    console.log('Available endpoints:');
    console.log('- POST /api/test-login - Test login');
    console.log('- GET /api/users - List all users');
    console.log('- POST /api/reset-password - Reset a user password');
});
