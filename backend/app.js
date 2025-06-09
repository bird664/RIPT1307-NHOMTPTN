const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import các routes
const authRoutes = require('./routes/authRoutes');
const questionRoutes = require('./routes/questionRoutes');

// Khởi tạo ứng dụng Express
const app = express();
const PORT = process.env.PORT || 5000;

// Hàm kết nối MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/forumDB', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB!');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);  // Dừng server nếu kết nối MongoDB thất bại
  }
};

// Cấu hình middleware
const setupMiddleware = () => {
  // Cấu hình CORS (Cross-Origin Resource Sharing)
  app.use(cors());  // Cho phép tất cả các domain gửi yêu cầu

  // Cấu hình body-parser để nhận dữ liệu JSON
  app.use(bodyParser.json());
};

// Xử lý lỗi khi không tìm thấy route
const handle404Errors = (req, res, next) => {
  res.status(404).json({
    message: 'Tài nguyên không tìm thấy',
  });
};

// Xử lý lỗi chung của ứng dụng
const handleErrors = (err, req, res, next) => {
  console.error(err.stack);  // In lỗi ra console
  res.status(500).json({ message: 'Đã xảy ra lỗi trong quá trình xử lý' });
};

// Sử dụng các middleware
setupMiddleware();

// Kết nối MongoDB
connectDB();

// Sử dụng các routes
app.use('/api/auth', authRoutes);  // Routes cho xác thực người dùng (đăng ký, đăng nhập)
app.use('/api/questions', questionRoutes);  // Routes cho câu hỏi

// Xử lý lỗi không tìm thấy route
app.use(handle404Errors);

// Xử lý các lỗi khác
app.use(handleErrors);

// Lắng nghe tại cổng
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
