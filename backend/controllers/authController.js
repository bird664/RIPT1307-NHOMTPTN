const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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
    return res.status(400).json({ message: 'Sai tài khoản hoặc mật khẩu' });
  }
  if (user.isLocked) {
    return res.status(403).json({ message: 'Tài khoản đã bị khóa' });
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

// Lấy tất cả người dùng
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách người dùng', error: error.message });
  }
};
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tìm thấy' });
    }
    res.json({ message: 'Người dùng đã được xóa' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa người dùng', error: error.message });
  }
};
// Khóa tài khoản
const lockUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tìm thấy' });
    }
    user.isLocked = true;  // Đánh dấu khóa tài khoản
    await user.save();
    res.json({ message: 'Tài khoản đã được khóa' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi khóa tài khoản', error: error.message });
  }
};

// Mở khóa tài khoản
const unlockUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tìm thấy' });
    }
    user.isLocked = false;
    await user.save();
    res.json({ message: 'Tài khoản đã được mở khóa' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi mở khóa tài khoản', error: error.message });
  }
};

// Cấp lại mật khẩu
const resetPassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = newPassword; // Gán plain text, để pre('save') tự hash
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
};

module.exports = { registerUser, loginUser, getAllUsers, deleteUser, lockUser, unlockUser, resetPassword };
