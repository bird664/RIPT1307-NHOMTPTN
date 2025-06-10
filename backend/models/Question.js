const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: { type: [String], required: true },
  username: { type: String, required: true },  // Thêm trường người đăng
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Thêm ID người đăng
  date: { type: Date, default: Date.now },
  comments: [
    {
      comment: { type: String, required: true },
      username: { type: String, required: true },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      date: { type: Date, default: Date.now },
      votes: { type: Number, default: 0 }, // ✅ Vote cho bình luận
      replies: [
      {
        reply: { type: String, required: true },
        username: { type: String, required: true },
        date: { type: Date, default: Date.now },
      }
    ],
    }
  ],
  votes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
},
{
  timestamps: true // ✅ Thêm này để tự động tạo createdAt, updatedAt
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
