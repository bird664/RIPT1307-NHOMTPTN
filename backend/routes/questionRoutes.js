// ✅ Sửa lại như sau:
const express = require('express');
const router = express.Router();
const { postQuestion, getAllQuestions, getQuestionById, addComment, replyToComment, voteComment, voteQuestion, getQuestionsBySearch, getQuestionsByTag, deleteQuestion } = require('../controllers/questionController');

// Đặt các route tĩnh lên trước
router.get('/search', getQuestionsBySearch);
router.get('/tags/:tag', getQuestionsByTag);

router.post('/', postQuestion);
router.get('/', getAllQuestions);
router.get('/:id', getQuestionById);
router.post('/:id/comments', addComment);
router.post('/:id/comments/:commentIndex/replies', replyToComment);
router.post('/:id/vote', voteQuestion);
router.post('/:id/comments/:commentIndex/vote', voteComment);
router.delete('/:id', deleteQuestion); // Thêm dòng này nếu chưa có

module.exports = router;
