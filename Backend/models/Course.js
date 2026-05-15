const { sequelize, DataTypes } = require('../config/database');

const Course = sequelize.define('Course', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    courseCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'course_code'
    },
    courseName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'course_name'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    credits: {
        type: DataTypes.INTEGER,
        defaultValue: 3
    },
    department: {
        type: DataTypes.STRING,
        allowNull: true
    },
    lecturerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'lecturer_id',
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'courses',
    timestamps: true,
    underscored: true
});

module.exports = Course;