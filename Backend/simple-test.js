const bcrypt = require("bcrypt");
const { sequelize } = require("./config/database");
const User = require("./models/User");

async function test() {
    try {
        await sequelize.authenticate();
        console.log("Database connected\n");
        
        // Delete existing test user
        await User.destroy({ where: { email: "test@example.com" } });
        
        // Create user with plain password (model will hash it)
        const user = await User.create({
            name: "Test User",
            email: "test@example.com",
            password: "mypassword123",
            role: "student",
            studentId: "TEST/001"
        });
        
        console.log("User created with ID:", user.id);
        console.log("Stored password hash:", user.password);
        console.log("Hash starts with $2b$:", user.password.startsWith("$2b$"));
        
        // Test password verification
        const isValid = await user.comparePassword("mypassword123");
        console.log("\nPassword verification result:", isValid);
        
        if (isValid) {
            console.log("✅ SUCCESS! Login will work!");
        } else {
            console.log("❌ FAILED! Login will not work");
        }
        
        process.exit();
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
}

test();
