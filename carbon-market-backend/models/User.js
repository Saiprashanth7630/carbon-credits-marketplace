// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  organization: { type: String, required: false },
  role: { type: String, required: false },
  location: { type: String, required: false },
  creditType: { type: String, required: false },
});

module.exports = mongoose.model('User', userSchema);
