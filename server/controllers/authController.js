const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Merchant = require('../models/Merchant');
const auditService = require('../services/auditService');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role = 'customer' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const user = new User({ name, email: email.toLowerCase(), password, role });

    if (role === 'merchant') {
      const merchant = await Merchant.create({
        name,
        businessName: `${name}'s Store`,
        email: email.toLowerCase(),
        userId: user._id,
      });
      user.merchantId = merchant._id;
    }

    await user.save();

    const token = generateToken(user._id);

    await auditService.log({
      userId: user._id,
      action: 'AUTH_REGISTER',
      input: { email, role },
      status: 'success',
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    await auditService.log({
      userId: user._id,
      action: 'AUTH_LOGIN',
      input: { email },
      status: 'success',
      ipAddress: req.ip,
    });

    let merchantData = null;
    if (user.merchantId) {
      merchantData = await Merchant.findById(user.merchantId);
    }

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.toJSON(),
      merchant: merchantData,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    let merchantData = null;
    if (req.user.merchantId) {
      merchantData = await Merchant.findById(req.user.merchantId);
    }
    res.json({ success: true, user: req.user, merchant: merchantData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, getMe };
