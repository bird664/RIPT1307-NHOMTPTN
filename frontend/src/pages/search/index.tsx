import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'umi';
import { LuTag } from "react-icons/lu";
import { AiOutlineLike, AiOutlineDislike } from "react-icons/ai";
import { FaRegComment } from "react-icons/fa";
import { BiSearch } from "react-icons/bi";
import './search.css';

const SearchPage: React.FC = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Lấy tất cả câu hỏi khi component mount
  useEffect(() => {
    const fetchAllQuestions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/questions');
        setAllQuestions(response.data.questions || []);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };
    fetchAllQuestions();
  }, []);

  // Popular tags extracted from all questions
  const popularTags = Array.from(new Set(allQuestions.flatMap((q) => q.tags || []))).slice(0, 10);

  // Hàm tìm kiếm
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      message.error('Vui lòng nhập từ khóa tìm kiếm');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/questions/search?search=${searchQuery}`);
      setQuestions(response.data.questions || []);
    } catch (error) {
      message.error('Lỗi khi tìm kiếm');
      console.error('Error during search:', error);
    } finally {
      setLoading(false);
    }
  };
  // Hàm lọc theo tag
  const handleFilterByTag = async (tag: string) => {
    setSelectedTag(tag);
    if (tag === 'all') {
      setQuestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/questions/tags/${tag}`);
      setQuestions(response.data.questions || []);
    } catch (error) {
      message.error('Lỗi khi lọc theo tag');
      console.error('Error during tag filter:', error);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý URL params khi component mount
  useEffect(() => {
    const tagFromUrl = searchParams.get('tag');
    if (tagFromUrl && tagFromUrl !== 'all') {
      setSelectedTag(tagFromUrl);
      handleFilterByTag(tagFromUrl);
    }
  }, [searchParams]);

  // Filter and sort questions
  const filteredQuestions = questions
    .filter(question => {
      const matchesSearch = searchQuery === '' ||
        question.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.content?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.views || 0) - (a.views || 0);
        case 'votes':
          return (b.votes || 0) - (a.votes || 0);
        case 'comments':
          return (b.comments?.length || 0) - (a.comments?.length || 0);
        default: // newest
          return new Date(b.createdAt || b.date || 0).getTime() - new Date(a.createdAt || a.date || 0).getTime();
      }
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };
  return (
    <div className="home-page">
      <div className="home-grid">
        {/* Main Content */}
        <div className="home-main-content">
          {/* Search Header */}
          <div className="search-header">
            <h1 className="search-page-title">Tìm kiếm câu hỏi</h1>
            <p className="search-description">Tìm kiếm câu hỏi theo từ khóa hoặc lọc theo tag</p>
          </div>

          {/* Search and Filters */}
          <div className="search-filters-card">
            <div className="search-filters-wrapper">
              <div className="search-input-wrappers">
                <input
                  className="search-input"
                  placeholder="Nhập từ khóa tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                  {/* <BiSearch className="search-icon" /> */}
                <button
                  className="search-button"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? 'Đang tìm...' : 'Tìm kiếm'}
                </button>
              </div>
              <select
                className="filter-select"
                value={selectedTag}
                onChange={(e) => handleFilterByTag(e.target.value)}
              >
                <option value="all">Tất cả tags</option>
                {popularTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
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

          {/* Search Results */}
          {questions.length > 0 && (
            <div className="search-results-header">
              <h2>Kết quả tìm kiếm ({filteredQuestions.length} câu hỏi)</h2>
            </div>
          )}

          {/* Questions List */}
          <div className="questions-list">
            {loading && (
              <div className="loading-message">
                <p>Đang tìm kiếm...</p>
              </div>
            )}

            {!loading && filteredQuestions.map((question) => (
              <div key={question._id} className="question-card">
                <div className="question-card-content">
                  <div className="question-main-wrapper">
                    {/* Vote Section */}
                    <div className="question-vote-section">
                      <button className="vote-btn" type="button">
                        <AiOutlineLike className="icon" />
                      </button>
                      <span className="vote-count">{question.votes || 0}</span>
                      <button className="vote-btn" type="button">
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
                        {question.content && question.content.length > 150
                          ? `${question.content.substring(0, 150)}...`
                          : question.content}
                      </p>

                      {/* Tags */}
                      <div className="question-tags">
                        {(question.tags || []).map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="question-tag"
                            onClick={() => handleFilterByTag(tag)}
                            style={{ cursor: 'pointer' }}
                          >
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
                            <span>{question.views || 0} lượt xem</span>
                          </div>
                        </div>
                        <div className="question-author-meta">
                          <div className="avatar">
                            {question.username ? question.username.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <span className="author-name">{question.username || 'Ẩn danh'}</span>
                          <span className="author-role">Sinh viên</span>
                          <span>•</span>
                          <span>{formatDate(question.createdAt || question.date || new Date().toISOString())}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>          {/* No Results */}
          {!loading && questions.length === 0 && searchQuery && (
            <div className="no-questions">
              <p>Không tìm thấy câu hỏi nào phù hợp với từ khóa &quot;{searchQuery}&quot;.</p>
              <p>Hãy thử tìm kiếm với từ khóa khác hoặc chọn tag từ danh sách bên phải.</p>
            </div>
          )}

          {/* Initial State */}
          {!loading && questions.length === 0 && !searchQuery && selectedTag === 'all' && (
            <div className="search-initial-state">
              <div className="search-tips">
                <h3>Mẹo tìm kiếm:</h3>
                <ul>
                  <li>Nhập từ khóa liên quan đến tiêu đề hoặc nội dung câu hỏi</li>
                  <li>Sử dụng filter theo tag để tìm câu hỏi theo chủ đề</li>
                  <li>Sắp xếp kết quả theo độ phổ biến, vote hoặc số bình luận</li>
                  <li>Click vào tag của câu hỏi để tìm các câu hỏi liên quan</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="home-sidebar">
          {/* Popular Tags */}
          <div className="sidebar-card">
            <div className="sidebar-card-header">
              <h3 className="sidebar-card-title">Tags phổ biến</h3>
            </div>
            <div className="sidebar-card-content">
              <div className="popular-tags">
                <button
                  className={`popular-tag ${selectedTag === 'all' ? 'active' : ''}`}
                  onClick={() => handleFilterByTag('all')}
                  type="button"
                >
                  <LuTag className="icon-small" />
                  Tất cả
                </button>
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    className={`popular-tag ${selectedTag === tag ? 'active' : ''}`}
                    onClick={() => handleFilterByTag(tag)}
                    type="button"
                  >
                    <LuTag className="icon-small" />
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search Tips */}
          <div className="sidebar-card">
            <div className="sidebar-card-header">
              <h3 className="sidebar-card-title">Hướng dẫn tìm kiếm</h3>
            </div>
            <div className="sidebar-card-content">
              <div className="search-tips-list">
                <div className="tip-item">
                  <strong>Tìm kiếm nhanh:</strong> Nhập từ khóa và nhấn Enter
                </div>
                <div className="tip-item">
                  <strong>Lọc theo tag:</strong> Click vào tag để xem câu hỏi liên quan
                </div>
                <div className="tip-item">
                  <strong>Sắp xếp:</strong> Sử dụng dropdown để sắp xếp kết quả
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
