const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// Handle user registration with hashed passwords.
async function registerUser({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) {
    const error = new Error('Email already registered');
    error.status = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: 'user'
  });

  const token = generateToken(user._id);
  return { user: sanitizeUser(user), token };
}

// Authenticate user credentials.
async function loginUser({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  const token = generateToken(user._id);
  return { user: sanitizeUser(user), token };
}

function sanitizeUser(user) {
  const { _id, name, email, role, createdAt, updatedAt } = user;
  return { id: String(_id), name, email, role, createdAt, updatedAt };
}

module.exports = { registerUser, loginUser, sanitizeUser };
