import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import axios from 'axios';
import { useParams } from 'umi';
import './question.css'
import { AiOutlineDislike, AiOutlineLike } from 'react-icons/ai';
import { IoShareSocialOutline, IoFlagOutline } from "react-icons/io5";
import { FaRegComment } from "react-icons/fa";

const QuestionDetailPage: React.FC = () => {
  const { id } = useParams();
  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [replyInputs, setReplyInputs] = useState<{ [key: number]: string }>({});
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [questionVotes, setQuestionVotes] = useState(0);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/questions/${id}`);
        setQuestion(response.data.question);
        setComments(response.data.question.comments || []);
        setQuestionVotes(response.data.question.votes || 0);
        setLoading(false);
      } catch (error) {
        message.error('Không thể tải bài viết');
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [id]);

  // ✅ Thêm function vote cho câu hỏi
  const handleVoteQuestion = async (type: 'up' | 'down') => {
    try {
      const response = await axios.post(`http://localhost:5000/api/questions/${id}/vote`, { type });
      setQuestionVotes(response.data.votes);
      message.success(`${type === 'up' ? 'Đã upvote' : 'Đã downvote'} câu hỏi`);
    } catch (error) {
      message.error('Không thể bình chọn');
    }
  };

  // ✅ Thêm function vote cho bình luận
  const handleVoteComment = async (commentIndex: number, vote: number) => {
    try {
      await axios.post(
        `http://localhost:5000/api/questions/${id}/comments/${commentIndex}/vote`,
        { vote }
      );
      
      // Cập nhật lại danh sách comments
      const response = await axios.get(`http://localhost:5000/api/questions/${id}`);
      setComments(response.data.question.comments || []);
      
      message.success(vote > 0 ? 'Đã upvote bình luận' : 'Đã downvote bình luận');
    } catch (error) {
      message.error('Không thể bình chọn bình luận');
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      message.error('Vui lòng nhập bình luận');
      return;
    }

    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!storedUser._id || !storedUser.username) {
      message.error('Bạn cần đăng nhập để bình luận');
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/questions/${id}/comments`,
        {
          comment: newComment,
          userId: storedUser._id,
          username: storedUser.username,
        }
      );

      setComments(response.data.question.comments);
      setNewComment('');
      message.success('Bình luận đã được thêm');
    } catch (error) {
      message.error('Không thể thêm bình luận');
    }
  };

  const handleSubmitReply = async (commentIndex: number) => {
    const reply = replyInputs[commentIndex];
    if (!reply || !reply.trim()) {
      message.error('Vui lòng nhập nội dung phản hồi');
      return;
    }

    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!storedUser.username) {
      message.error('Bạn cần đăng nhập để trả lời');
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/questions/${id}/comments/${commentIndex}/replies`,
        {
          reply,
          username: storedUser.username,
        }
      );

      setComments(response.data.question.comments);
      setReplyInputs((prev) => ({ ...prev, [commentIndex]: '' }));
      setReplyTo(null);
      message.success('Đã trả lời bình luận');
    } catch (error) {
      message.error('Không thể trả lời bình luận');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) return <div>Đang tải...</div>;
  
  return (
    <div className="question-detail-container">
      {/* Main Question Card */}
      <div className="question-card">
        <div className="card-content">
          <div className="question-main-content">
            {/* Vote Section */}
            <div className="vote-section">
              <button 
                className="vote-btn" 
                type="button"
                onClick={() => handleVoteQuestion('up')}
              >
                <AiOutlineLike className="icon" />
              </button>
              <span className="vote-count">{questionVotes}</span>
              <button 
                className="vote-btn" 
                type="button"
                onClick={() => handleVoteQuestion('down')}
              >
                <AiOutlineDislike className="icon" />
              </button>
            </div>

            {/* Question Content */}
            <div className="question-content-main">
              <span className="question-title">{question.title}</span>

              <div className="question-descriptions">
                {question.content}
              </div>

              {/* Tags */}
              <div className="question-tags">
                {question.tags.map((tag: string, index: number) => (
                  <span key={index} className="question-tag">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Actions and Meta */}
              <div className="question-actions-meta">
                <div className="question-actions">
                  <button className="action-btn" type="button">
                    <IoShareSocialOutline className="icon-small" />
                    Chia sẻ
                  </button>
                  <button className="action-btn" type="button">
                    <IoFlagOutline className="icon-small" />
                    Báo cáo
                  </button>
                </div>
                <div className="question-author-meta">
                  <div className="avatar">
                    {question.username ? question.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="author-info">
                    <div className="author-main">
                      <span className="author-name">{question.username}</span>
                      <span className="author-role">Sinh viên</span>
                    </div>
                    <div className="post-meta">
                      Đăng {formatDate(question.createdAt || new Date().toISOString())} • {question.views || 0} lượt xem
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="comments-section">
        <h2 className="comments-header">{comments.length} Bình luận</h2>

        {/* Comments List */}
        <div className="comments-list">
          {comments.map((commentItem, index) => (
            <div key={index} className="comment-card">
              <div className="comment-content-wrapper">
                {/* Vote Section - ✅ Đã sửa để có function */}
                <div className="comment-vote-section">
                  <button 
                    className="vote-btn" 
                    type="button"
                    onClick={() => handleVoteComment(index, 1)}
                  >
                    <AiOutlineLike className="icon-small" />
                  </button>
                  <span className="vote-count-small">{commentItem.votes || 0}</span>
                  <button 
                    className="vote-btn" 
                    type="button"
                    onClick={() => handleVoteComment(index, -1)}
                  >
                    <AiOutlineDislike className="icon-small" />
                  </button>
                </div>

                {/* Comment Content */}
                <div className="comment-content-main">
                  <div className="comment-text">
                    {commentItem.comment}
                  </div>

                  {/* Comment Meta */}
                  <div className="comment-actions-meta">
                    <div className="comment-actions">
                      <button
                        className="action-btn"
                        type="button"
                        onClick={() => setReplyTo(replyTo === index ? null : index)}
                      >
                        <FaRegComment className="icon-small" />
                        Trả lời
                      </button>
                    </div>
                    <div className="comment-author-meta">
                      <div className="avatar avatar-small">
                        {commentItem.username ? commentItem.username.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span className="author-name">{commentItem.username}</span>
                      <span className="author-role">Sinh viên</span>
                      <span>•</span>
                      <span>{formatDate(commentItem.date || new Date().toISOString())}</span>
                    </div>
                  </div>

                  {/* Reply Form */}
                  {replyTo === index && (
                    <div className="reply-form">
                      <textarea
                        className="reply-textarea"
                        placeholder="Viết câu trả lời..."
                        value={replyInputs[index] || ''}
                        onChange={(e) =>
                          setReplyInputs((prev) => ({
                            ...prev,
                            [index]: e.target.value,
                          }))
                        }
                        rows={3}
                      />
                      <div className="reply-actions">
                        <button
                          className="btn-primary-small"
                          type="button"
                          onClick={() => handleSubmitReply(index)}
                        >
                          Gửi trả lời
                        </button>
                        <button
                          className="btn-secondary-small"
                          type="button"
                          onClick={() => setReplyTo(null)}
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Replies */}
                  {commentItem.replies?.length > 0 && (
                    <div className="replies-section">
                      <div className="replies-list">
                        {commentItem.replies.map((reply: any, replyIndex: number) => (
                          <div key={replyIndex} className="reply-item">
                            <div className="reply-vote-section">
                              <button className="vote-btn" type="button">
                                <AiOutlineLike className="icon-tiny" />
                              </button>
                              <span className="vote-count-tiny">{reply.votes || 0}</span>
                              <button className="vote-btn" type="button">
                                <AiOutlineDislike className="icon-tiny" />
                              </button>
                            </div>
                            <div className="reply-content">
                              <p className="reply-text">{reply.reply}</p>
                              <div className="reply-meta">
                                <div className="avatar avatar-tiny">
                                  {reply.username ? reply.username.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <span className="author-name">{reply.username}</span>
                                <span className="author-role">Sinh viên</span>
                                <span>•</span>
                                <span>{formatDate(reply.date || new Date().toISOString())}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Comment Form */}
        <div className="add-comment-card">
          <h3 className="add-comment-title">Thêm bình luận</h3>
          <textarea
            className="comment-textarea"
            placeholder="Viết bình luận của bạn..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={4}
          />
          <button className="btn-primary" type="button" onClick={handleSubmitComment}>
            Gửi bình luận
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetailPage;