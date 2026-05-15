const { Sequelize, DataTypes } = require('sequelize');

// SQLite - no server needed, creates a file called database.sqlite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
});

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ SQLite database connected successfully');
        return true;
    } catch (error) {
        console.error('❌ Database error:', error.message);
        return false;
    }
};

module.exports = { sequelize, testConnection, DataTypes };
