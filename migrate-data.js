require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs-extra');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://Rahti:rahti2026@cluster0.vz1u9w3.mongodb.net/?appName=Cluster0";
const USERS_FILE = path.join(__dirname, "users.json");

// Define User Schema (same as in server.js)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  age: Number,
  sexe: String,
  hopital: String,
  service: String,
  experience: Number,
  tests: [{
    score: Number,
    category: String,
    date: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function migrate() {
  try {
    console.log('--- Start Migration ---');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB Atlas.');

    if (!(await fs.pathExists(USERS_FILE))) {
      console.log('users.json not found. Nothing to migrate.');
      process.exit(0);
    }

    const localUsers = await fs.readJson(USERS_FILE);
    console.log(`Found ${localUsers.length} users in users.json.`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const localUser of localUsers) {
      const existingUser = await User.findOne({ email: localUser.email });
      if (!existingUser) {
        await User.create(localUser);
        migratedCount++;
      } else {
        skippedCount++;
      }
    }

    console.log(`Migration finished!`);
    console.log(`- Migrated: ${migratedCount}`);
    console.log(`- Skipped (already exist): ${skippedCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
