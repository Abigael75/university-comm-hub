const { sequelize, DataTypes } = require('../config/database');

const Announcement = sequelize.define('Announcement', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    audience: {
        type: DataTypes.ENUM('all', 'students', 'lecturers', 'admins'),
        defaultValue: 'all'
    },
    postedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'posted_by',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'expires_at'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    }
}, {
    tableName: 'announcements',
    timestamps: true,
    underscored: true
});

module.exports = Announcement;