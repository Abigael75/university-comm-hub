const { sequelize, DataTypes } = require('../config/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    studentId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true
    },
    staffId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('student', 'lecturer', 'admin'),
        defaultValue: 'student'
    },
    department: {
        type: DataTypes.STRING,
        allowNull: true
    },
    faculty: {
        type: DataTypes.STRING,
        allowNull: true
    },
    yearOfStudy: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    lastLogin: {
        type: DataTypes.DATE,
        allowNull: true
    },
    loginHistory: {
        type: DataTypes.JSON,
        defaultValue: []
    }
}, {
    tableName: 'users',
    timestamps: true,
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                // Only hash if not already hashed
                if (!user.password.startsWith('$')) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                    console.log('Password hashed for:', user.email);
                }
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                if (!user.password.startsWith('$')) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                    console.log('Password updated for:', user.email);
                }
            }
        }
    }
});

User.prototype.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;
