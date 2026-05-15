const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite');

db.all('SELECT id, email, role, name FROM users', (err, rows) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('========================================');
        console.log('Users in database:');
        console.log('========================================');
        if (rows.length === 0) {
            console.log('No users found!');
        } else {
            rows.forEach(row => {
                console.log('ID: ' + row.id);
                console.log('  Email: ' + row.email);
                console.log('  Role: ' + row.role);
                console.log('  Name: ' + row.name);
                console.log('----------------------------------------');
            });
        }
        console.log('Total: ' + rows.length + ' user(s)');
        console.log('========================================');
    }
    db.close();
});
