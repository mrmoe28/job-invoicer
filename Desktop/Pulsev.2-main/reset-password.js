const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Configuration
const EMAIL_TO_RESET = 'ekosolarize@gmail.com';
const NEW_PASSWORD = 'test1234';

async function resetPassword() {
    try {
        // Read database
        const dbPath = path.join(__dirname, 'apps/web/data/database.json');
        const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        
        // Find user
        const userIndex = db.users.findIndex(u => u.email === EMAIL_TO_RESET);
        
        if (userIndex === -1) {
            console.error('❌ User not found:', EMAIL_TO_RESET);
            return;
        }
        
        const user = db.users[userIndex];
        console.log('Found user:', user.firstName, user.lastName);
        
        // Hash new password
        console.log('Hashing new password...');
        const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 12);
        
        // Update password
        db.users[userIndex].password = hashedPassword;
        db.users[userIndex].updatedAt = new Date().toISOString();
        
        // Write back to database
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
        
        console.log('✅ Password reset successfully!');
        console.log('');
        console.log('You can now login with:');
        console.log('Email:', EMAIL_TO_RESET);
        console.log('Password:', NEW_PASSWORD);
        
    } catch (error) {
        console.error('Error resetting password:', error);
    }
}

resetPassword();
