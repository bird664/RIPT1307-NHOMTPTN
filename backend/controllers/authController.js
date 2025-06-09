const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Đăng ký người dùng mới
const registerUser = async (req, res) => {
  const { username, email, password, role } = req.body;

  // Kiểm tra người dùng đã tồn tại chưa
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  try {
    const user = new User({ username, email, password, role });
    await user.save();

    // Tạo JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, 'secret', { expiresIn: '30d' });
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,  // Trả về role khi đăng ký thành công
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Đăng nhập người dùng
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const isPasswordMatch = await user.matchPassword(password);
  if (!isPasswordMatch) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  // Tạo JWT token
  const token = jwt.sign({ id: user._id, role: user.role }, 'secret', { expiresIn: '30d' });

  res.json({
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,  // Trả về role khi đăng nhập thành công
    token,
  });
};

module.exports = { registerUser, loginUser };
