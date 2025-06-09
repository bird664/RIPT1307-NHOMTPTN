// ✅ Sửa lại như sau:
const express = require('express');
const router = express.Router();
const { postQuestion, getAllQuestions, getQuestionById, addComment, replyToComment, voteComment, voteQuestion } = require('../controllers/questionController');

router.post('/', postQuestion);
router.get('/', getAllQuestions);
router.get('/:id', getQuestionById);
router.post('/:id/comments', addComment);
router.post('/:id/comments/:commentIndex/replies', replyToComment);
router.post('/:id/vote', voteQuestion);
router.post('/:id/comments/:commentIndex/vote', voteComment);


module.exports = router;
