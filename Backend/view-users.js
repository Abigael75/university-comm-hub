const User = require('./models/User');

async function viewUsers() {
    try {
        const users = await User.findAll();
        
        console.log('==================================================');
        console.log('           ALL REGISTERED USERS');
        console.log('==================================================');
        console.log('');
        
        if (users.length === 0) {
            console.log('   No users found in database.');
        } else {
            for (let i = 0; i < users.length; i++) {
                const u = users[i];
                console.log('[' + (i + 1) + '] ' + u.name);
                console.log('    Email: ' + u.email);
                console.log('    Role: ' + u.role.toUpperCase());
                if (u.studentId) {
                    console.log('    Student ID: ' + u.studentId);
                }
                if (u.staffId) {
                    console.log('    Staff ID: ' + u.staffId);
                }
                if (u.department) {
                    console.log('    Department: ' + u.department);
                }
                console.log('    Created: ' + new Date(u.createdAt).toLocaleDateString());
                console.log('----------------------------------------');
            }
        }
        
        console.log('');
        console.log('TOTAL USERS: ' + users.length);
        console.log('==================================================');
        process.exit();
    } catch (error) {
        console.error('Error: ' + error.message);
        process.exit(1);
    }
}

viewUsers();
