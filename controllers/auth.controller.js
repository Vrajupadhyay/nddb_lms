// controllers/auth.controller.js
const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
const createModel = require('../models/record.model');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const User = await createModel('users');

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Invalid email', data: null });
    }

    // const isMatch = await bcrypt.compare(password, user.password);
    const isMatch = password === user.password;
    if (!isMatch) {
      return res.status(401).json({ status: 'error', message: 'Invalid password', data: null });
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET);

    res.json({
      status: 'success',
      message: 'Login successful',
      data: { token, user: { id: user._id, email: user.email, name: user.name } },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error', data: null });
  }
};

exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const User = await createModel('User');

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status: 'error', message: 'Email already registered', data: null });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ email, password: hashedPassword, name });
    await newUser.save();

    res.json({ status: 'success', message: 'User registered successfully', data: { id: newUser._id, email, name } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error', data: null });
  }
};
