require('dotenv').config({ quiet: true });

// all env vars are read here, don't use process.env anywhere else
const env = {
  port: parseInt(process.env.PORT, 10),
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  corsOrigin: (process.env.CORS_ORIGIN).split(',').map((o) => o.trim()),
  admin: {
    name: 'Admin',
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  },
};

function assertEnv() {
  if (!env.mongoUri || !env.jwtSecret) {
    throw new Error('MONGO_URI and JWT_SECRET are required');
  }
}

module.exports = { env, assertEnv };
