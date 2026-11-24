const mongoose = require('mongoose');

async function connectDB(uri) {
  await mongoose.connect(uri, { maxPoolSize: 50 });
}

module.exports = { connectDB };
