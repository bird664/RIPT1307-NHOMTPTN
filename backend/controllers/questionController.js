const Question = require('../models/Question');
const sendMail = require('../utils/sendMail');

// Lấy tất cả câu hỏi
const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find();  // Lấy tất cả câu hỏi
    res.status(200).json({ questions });
  } catch (error) {
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách câu hỏi', error: error.message });
  }
};

// Đăng bài mới
const postQuestion = async (req, res) => {
  const { title, content, tags, userId, username } = req.body;

  if (!title || !content || !tags || !userId || !username) {
    return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
  }

  try {
    const newQuestion = new Question({
      title,
      content,
      tags,
      username,
      userId,
    });

    await newQuestion.save();

    // Trả về kết quả cho client NGAY LẬP TỨC
    res.status(200).json({
      message: 'Đăng bài thành công',
      question: newQuestion,
    });

    // Gửi email SAU khi đã trả về kết quả (không await)
    sendMail(
      'vutrongtien215@gmail.com',
      'Có bài đăng mới trên diễn đàn',
      `Tiêu đề: ${newQuestion.title}\nNội dung: ${newQuestion.content}`
    ).catch(mailErr => {
      console.error('Lỗi gửi mail:', mailErr);
    });

  } catch (error) {
    res.status(500).json({ message: 'Đã xảy ra lỗi khi đăng bài', error: error.message });
  }
};

// Lấy thông tin bài viết theo ID
const getQuestionById = async (req, res) => {
  const { id } = req.params;

  try {
    const question = await Question.findById(id);  // Tìm bài viết theo ID
    if (!question) {
      return res.status(404).json({ message: 'Bài viết không tồn tại' });
    }
    res.status(200).json({ question });
  } catch (error) {
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy bài viết', error: error.message });
  }
};

// Thêm bình luận vào bài viết
const addComment = async (req, res) => {
  const { id } = req.params;  // Lấy ID bài viết
  const { comment, userId, username } = req.body;  // Lấy thông tin bình luận

  try {
    const question = await Question.findById(id);  // Tìm bài viết theo ID
    if (!question) {
      return res.status(404).json({ message: 'Bài viết không tồn tại' });
    }

    // Thêm bình luận vào bài viết
    question.comments.push({ comment, userId, username, date: new Date() });
    await question.save();

    res.status(200).json({ message: 'Bình luận đã được thêm', question });

    // Gửi email thông báo có bình luận mới
    try {
      await sendMail(
        'vutrongtien215@gmail.com',
        'Có bình luận mới trên diễn đàn',
        `Bài: ${question.title}\nBình luận: ${comment}\nNgười bình luận: ${username}`
      );
    } catch (mailErr) {
      console.error('Lỗi gửi mail:', mailErr);
    }
  } catch (error) {
    res.status(500).json({ message: 'Đã xảy ra lỗi khi thêm bình luận', error: error.message });
  }
};
const replyToComment = async (req, res) => {
  const { id, commentIndex } = req.params;
  const { reply, username } = req.body;

  try {
    const question = await Question.findById(id);
    if (!question) return res.status(404).json({ message: 'Bài viết không tồn tại' });

    if (!question.comments[commentIndex]) {
      return res.status(404).json({ message: 'Bình luận không tồn tại' });
    }

    question.comments[commentIndex].replies.push({
      reply,
      username,
      date: new Date(),
    });

    await question.save();
    res.status(200).json({ message: 'Đã trả lời bình luận', question });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi trả lời bình luận', error: error.message });
  }
};
const voteQuestion = async (req, res) => {
  const { id } = req.params;
  const { type } = req.body; // 'up' hoặc 'down'
  try {
    const question = await Question.findById(id);
    if (!question) return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });

    if (type === 'up') {
      question.votes = (question.votes || 0) + 1;
    } else if (type === 'down') {
      question.votes = (question.votes || 0) - 1;
    }
    await question.save();
    res.json({ votes: question.votes });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi bình chọn', error: error.message });
  }
};
const voteComment = async (req, res) => {
  const { id, commentIndex } = req.params;
  const { vote } = req.body;

  try {
    const question = await Question.findById(id);
    if (!question || !question.comments[commentIndex]) {
      return res.status(404).json({ message: 'Không tìm thấy bình luận' });
    }

    question.comments[commentIndex].votes += vote;
    await question.save();

    res.status(200).json({ message: 'Đã vote bình luận', votes: question.comments[commentIndex].votes });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi vote bình luận', error: error.message });
  }
};
// Tìm kiếm câu hỏi theo từ khóa

// Lọc câu hỏi theo tag
const getQuestionsByTag = async (req, res) => {
  const { tag } = req.params;  // Lấy tag từ params

  try {
    const questions = await Question.find({
      tags: { $in: [tag] }  // Lọc theo tags
    });

    res.status(200).json({ questions });
  } catch (error) {
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lọc câu hỏi theo tag', error: error.message });
  }
};
// Tìm kiếm câu hỏi theo từ khóa
const getQuestionsBySearch = async (req, res) => {
  const { search } = req.query;
  if (!search || search.trim() === '') {
    return res.status(400).json({ message: 'Từ khóa tìm kiếm không hợp lệ' });
  }
  try {
    const questions = await Question.find({
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ],
    });
    // Luôn trả về mảng (có thể rỗng)
    res.status(200).json({ questions });
  } catch (error) {
    res.status(500).json({ message: 'Đã xảy ra lỗi khi tìm kiếm câu hỏi', error: error.message });
  }
};
// Xóa bài đăng
const deleteQuestion = async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa bài đăng' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa bài đăng', error: error.message });
  }
};
module.exports = {
  postQuestion,
  getAllQuestions,  // Thêm hàm lấy tất cả câu hỏi
  getQuestionById,
  addComment,
  replyToComment,
  voteQuestion,
  voteComment,
  getQuestionsBySearch,
  getQuestionsByTag,
  deleteQuestion,
};
