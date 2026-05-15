const fs = require('fs');
const path = require('path');
const { sequelize } = require('../config/database');
const User = require('../models/User');

class BackupManager {
    constructor() {
        this.backupDir = path.join(__dirname, '../backups');
        this.ensureBackupDirectory();
    }

    ensureBackupDirectory() {
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
            console.log('✅ Backup directory created');
        }
    }

    // Create database backup
    async createBackup() {
        const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
        const backupFile = path.join(this.backupDir, backup_.json);
        
        try {
            // Get all users
            const users = await User.findAll({
                attributes: { exclude: ['password'] } // Don't backup passwords
            });
            
            // Get all tables data (you can add more models here)
            const backupData = {
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                users: users.map(u => u.toJSON()),
                stats: {
                    totalUsers: users.length,
                    students: users.filter(u => u.role === 'student').length,
                    lecturers: users.filter(u => u.role === 'lecturer').length,
                    admins: users.filter(u => u.role === 'admin').length
                }
            };
            
            // Write to file
            fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
            console.log(✅ Backup created: );
            
            // Keep only last 10 backups
            this.cleanupOldBackups();
            
            return backupFile;
        } catch (error) {
            console.error('❌ Backup failed:', error);
            return null;
        }
    }
    
    // Restore from backup
    async restoreBackup(backupFile) {
        try {
            const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
            
            // Restore users (excluding passwords)
            for (const userData of backupData.users) {
                const [user, created] = await User.findOrCreate({
                    where: { email: userData.email },
                    defaults: userData
                });
                
                if (!created) {
                    await user.update(userData);
                }
            }
            
            console.log(✅ Restored from backup: );
            return true;
        } catch (error) {
            console.error('❌ Restore failed:', error);
            return false;
        }
    }
    
    // List all backups
    listBackups() {
        const files = fs.readdirSync(this.backupDir)
            .filter(f => f.startsWith('backup_') && f.endsWith('.json'))
            .map(f => ({
                name: f,
                path: path.join(this.backupDir, f),
                size: fs.statSync(path.join(this.backupDir, f)).size,
                modified: fs.statSync(path.join(this.backupDir, f)).mtime
            }))
            .sort((a, b) => b.modified - a.modified);
        
        return files;
    }
    
    // Cleanup old backups (keep last 10)
    cleanupOldBackups() {
        const backups = this.listBackups();
        if (backups.length > 10) {
            const toDelete = backups.slice(10);
            toDelete.forEach(backup => {
                fs.unlinkSync(backup.path);
                console.log(Deleted old backup: );
            });
        }
    }
    
    // Auto backup schedule
    startAutoBackup(intervalHours = 24) {
        const intervalMs = intervalHours * 60 * 60 * 1000;
        
        // Run initial backup
        this.createBackup();
        
        // Schedule regular backups
        setInterval(() => {
            this.createBackup();
        }, intervalMs);
        
        console.log(✅ Auto-backup scheduled every  hours);
    }
    
    // Export to CSV
    async exportToCSV() {
        const users = await User.findAll({
            attributes: ['id', 'name', 'email', 'role', 'department', 'createdAt', 'lastLogin']
        });
        
        const headers = ['ID', 'Name', 'Email', 'Role', 'Department', 'Created At', 'Last Login'];
        const rows = users.map(u => [
            u.id, u.name, u.email, u.role, u.department || 'N/A',
            u.createdAt.toISOString(), u.lastLogin ? u.lastLogin.toISOString() : 'Never'
        ]);
        
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
        
        const csvFile = path.join(this.backupDir, export_.csv);
        fs.writeFileSync(csvFile, csvContent);
        console.log(✅ CSV exported: );
        return csvFile;
    }
}

module.exports = new BackupManager();
