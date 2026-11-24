// creates the admin user from ADMIN_EMAIL / ADMIN_PASSWORD
const mongoose = require('mongoose');
const { env } = require('../src/config/env');
const { connectDB } = require('../src/config/db');
const User = require('../src/models/User');

(async () => {
  try {
    const { name, email, password } = env.admin;
    if (!env.mongoUri) throw new Error('MONGO_URI is not set');
    if (!email || !password) throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set');

    await connectDB(env.mongoUri);
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      console.log(`Admin user ${email} already exists`);
    } else {
      await User.create({ name, email, passwordHash: await User.hashPassword(password), role: 'admin' });
      console.log(`Created admin user ${email}`);
    }
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
