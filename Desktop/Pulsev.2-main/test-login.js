const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Read the database file
const dbPath = path.join(__dirname, 'apps/web/data/database.json');
const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Test credentials
const testEmail = 'ekosolarize@gmail.com';
const testPassword = 'test1234'; // Change this to the password you used during signup

console.log('Testing login for:', testEmail);
console.log('');

// Find the user
const user = dbData.users.find(u => u.email === testEmail);

if (!user) {
    console.log('❌ User not found!');
    process.exit(1);
}

console.log('✅ User found:');
console.log('  - Name:', user.firstName, user.lastName);
console.log('  - Organization:', user.organizationName);
console.log('  - Created:', user.createdAt);
console.log('');

// Test password
console.log('Testing password...');
bcrypt.compare(testPassword, user.password).then(isValid => {
    if (isValid) {
        console.log('✅ Password is correct!');
        console.log('');
        console.log('This user should be able to login successfully.');
    } else {
        console.log('❌ Password is incorrect!');
        console.log('');
        console.log('The password you entered does not match the stored password.');
        console.log('Please make sure you\'re using the correct password.');
    }
}).catch(err => {
    console.error('Error checking password:', err);
});
