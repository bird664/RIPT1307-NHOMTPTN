const express = require('express');
const { registerUser, loginUser, getAllUsers, deleteUser, lockUser, resetPassword, unlockUser } = require('../controllers/authController');
const router = express.Router();

// Đăng ký
router.post('/register', registerUser);

// Đăng nhập
router.post('/login', loginUser);

// Lấy tất cả người dùng
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);  // Định nghĩa route xóa người dùng
// Khóa tài khoản
router.put('/users/:id/lock', lockUser);
// Mở khóa tài khoản
router.put('/users/:id/unlock', unlockUser);
// Cấp lại mật khẩu
router.put('/users/:id/reset-password', resetPassword);


module.exports = router;
