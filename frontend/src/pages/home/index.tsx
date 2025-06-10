import { message } from 'antd';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'umi';
import './home.css'
import { LuTag } from "react-icons/lu";
import { AiOutlineLike, AiOutlineDislike } from "react-icons/ai";
import { FaRegComment } from "react-icons/fa";
import { BiSearch } from "react-icons/bi";

const HomePage: React.FC = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState('newest');
  const navigate = useNavigate();

  // Popular tags extracted from questions
  const popularTags = Array.from(new Set(questions.flatMap((q) => q.tags))).slice(0, 10);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/questions');
        setQuestions(response.data.questions);
        setLoading(false);
      } catch (error) {
        message.error('Không thể tải danh sách câu hỏi');
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Sort questions (no filtering on home page)
  const sortedQuestions = [...questions].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return (b.views || 0) - (a.views || 0);
      case 'votes':
        return (b.votes || 0) - (a.votes || 0);
      case 'comments':
        return (b.comments?.length || 0) - (a.comments?.length || 0);
      default: // newest
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const handleVote = async (questionId: string, type: 'up' | 'down') => {
    try {
      await axios.post(`http://localhost:5000/api/questions/${questionId}/vote`, { type });
      // Sau khi vote thành công, cập nhật lại danh sách câu hỏi
      const response = await axios.get('http://localhost:5000/api/questions');
      setQuestions(response.data.questions);
    } catch (error) {
      message.error('Bình chọn thất bại');
    }
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }
  return (
    <div className="home-page">
      <div className="home-grid">
        {/* Main Content */}
        <div className="home-main-content">
          {/* Header với nút Search */}
          <div className="home-header">
            <div className="home-header-content">
              <h1 className="home-title">Câu hỏi mới nhất</h1>
              <div className="home-actions">
                <button
                  className="search-button"
                  onClick={() => navigate('/search')}
                  type="button"
                >
                  <BiSearch className="icon-small" />
                  Tìm kiếm câu hỏi
                </button>
                <select
                  className="filter-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Mới nhất</option>
                  <option value="popular">Phổ biến</option>
                  <option value="votes">Nhiều vote</option>
                  <option value="comments">Nhiều bình luận</option>
                </select>
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div className="questions-list">
            {sortedQuestions.map((question) => (
              <div key={question._id} className="question-card">
                <div className="question-card-content">
                  <div className="question-main-wrapper">
                    {/* Vote Section */}
                    <div className="question-vote-section">
                      <button
                        className="vote-btn"
                        type="button"
                        onClick={() => handleVote(question._id, 'up')}
                      >
                        <AiOutlineLike className="icon" />
                      </button>
                      <span className="vote-count">{question.votes || 0}</span>
                      <button
                        className="vote-btn"
                        type="button"
                        onClick={() => handleVote(question._id, 'down')}
                      >
                        <AiOutlineDislike className="icon" />
                      </button>
                    </div>

                    {/* Question Content */}
                    <div className="question-content-wrapper">
                      <a
                        href={`/questions/${question._id}`}
                        className="question-title-link"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/questions/${question._id}`);
                        }}
                      >
                        <h3 className="question-title">{question.title}</h3>
                      </a>
                      <p className="question-description">
                        {question.content.length > 100
                          ? `${question.content.substring(0, 100)}...`
                          : question.content}
                      </p>

                      {/* Tags */}
                      <div className="question-tags">
                        {question.tags.map((tag: string, index: number) => (
                          <span key={index} className="question-tag">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Meta Info */}
                      <div className="question-meta">
                        <div className="question-stats">
                          <div className="stat-item">
                            <FaRegComment className="icon-small" />
                            <span>{question.comments?.length || 0} bình luận</span>
                          </div>
                          <div className="stat-item">
                            <span>{question.views || 50} lượt xem</span>
                          </div>
                        </div>
                        <div className="question-author-meta">
                          <div className="avatar">
                            {question.username ? question.username.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <span className="author-name">{question.username}</span>
                          <span className="author-role">Sinh viên</span>
                          <span>•</span>
                          <span>{formatDate(question.createdAt || new Date().toISOString())}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>          {sortedQuestions.length === 0 && !loading && (
            <div className="no-questions">
              <p>Chưa có câu hỏi nào được đăng.</p>
              <p>Hãy là người đầu tiên đặt câu hỏi!</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="home-sidebar">          {/* Popular Tags */}
          <div className="sidebar-card">
            <div className="sidebar-card-header">
              <h3 className="sidebar-card-title">Tags phổ biến</h3>
            </div>
            <div className="sidebar-card-content">
              <div className="popular-tags">
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    className="popular-tag"
                    onClick={() => navigate(`/search?tag=${tag}`)}
                    type="button"
                  >
                    <LuTag className="icon-small" />
                    {tag}
                  </button>
                ))}
              </div>
              {/* <div className="search-link-wrapper">
              <button
                className="search-all-tags-link"
                onClick={() => navigate('/search')}
                type="button"
              >
                Xem tất cả tags →
              </button>
            </div> */}
            </div>
          </div>

          {/* Stats */}
          <div className="sidebar-card">
            <div className="sidebar-card-header">
              <h3 className="sidebar-card-title">Thống kê</h3>
            </div>
            <div className="sidebar-card-content">
              <div className="stats-list">
                <div className="stat-row">
                  <span className="stat-label">Tổng câu hỏi:</span>
                  <span className="stat-value">1,234</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Câu hỏi hôm nay:</span>
                  <span className="stat-value">{questions.length}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Người dùng:</span>
                  <span className="stat-value">
                    {Array.from(new Set(questions.map(q => q.username))).length}
                  </span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Giảng viên:</span>
                  <span className="stat-value">
                    {Array.from(new Set(questions.map(q => q.lecturer))).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
