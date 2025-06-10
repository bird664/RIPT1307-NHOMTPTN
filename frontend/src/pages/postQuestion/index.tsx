import { message } from 'antd';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'umi';
import './postQuestion.css'

const PostQuestionPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [department, setDepartment] = useState('');
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  // Department options
  const departments = [
    { value: 'computer-science', label: 'Khoa Công nghệ Thông tin' },
    { value: 'mathematics', label: 'Khoa Toán học' },
    { value: 'physics', label: 'Khoa Vật lý' },
    { value: 'engineering', label: 'Khoa Kỹ thuật' },
    { value: 'business', label: 'Khoa Kinh tế' },
    { value: 'literature', label: 'Khoa Văn học' },
    { value: 'other', label: 'Khác' }
  ];

  // Popular tags
  const popularTags = [
    'JavaScript', 'Python', 'React', 'Node.js', 'CSS', 'HTML',
    'Database', 'Algorithm', 'Data Structure', 'Web Development'
  ];

  // Check if user is logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      message.error('Bạn cần đăng nhập để đăng bài');
      navigate('/login');
    }
  }, [navigate]);

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!title || !content || tags.length === 0) {
      message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (!user) {
      message.error('Bạn cần đăng nhập để đăng bài');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/questions', {
        title,
        content,
        tags,
        department,
        userId: user._id,
        username: user.username,
      });

      const newQuestion = response.data.question;
      console.log('Bài viết mới:', newQuestion);

      message.success('Đăng câu hỏi thành công');
      navigate('/');
    } catch (error) {
      message.error('Đăng câu hỏi không thành công');
    }
  }; return (
    <div className="post-question-container">
      <div className="question-grid">
        {/* Main Form */}
        <div>
          <div className="question-card">
            <div className="card-header">
              <h1 className="card-title">Đặt câu hỏi mới</h1>
            </div>
            <div className="card-content">
              <div className="form-space">
                {/* Title */}
                <div className="field-group">
                  <label className="field-label" htmlFor="title">Tiêu đề câu hỏi *</label>
                  <input
                    id="title"
                    className="field-input"
                    placeholder="Ví dụ: Làm thế nào để tối ưu hóa thuật toán sắp xếp trong C++?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <p className="field-hint">
                    Hãy viết tiêu đề rõ ràng, cụ thể để mọi người dễ hiểu vấn đề của bạn
                  </p>
                </div>

                {/* Department */}
                <div className="field-group">
                  <label className="field-label" htmlFor="department">Khoa/Bộ môn</label>
                  <select
                    className="field-input"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    <option value="">Chọn khoa/bộ môn liên quan</option>
                    {departments.map((dept) => (
                      <option key={dept.value} value={dept.value}>
                        {dept.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Content */}
                <div className="field-group">
                  <label className="field-label" htmlFor="content">Nội dung chi tiết *</label>
                  <textarea
                    id="content"
                    className="field-textarea"
                    placeholder="Mô tả chi tiết vấn đề của bạn. Bạn có thể bao gồm:
- Bối cảnh của vấn đề
- Những gì bạn đã thử
- Code mẫu (nếu có)
- Kết quả mong muốn"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                  <p className="field-hint">
                    Càng chi tiết càng tốt. Bạn có thể sử dụng Markdown để format text.
                  </p>
                </div>

                {/* Tags */}
                <div className="field-group">
                  <label className="field-label">Tags *</label>
                  <div className="tags-container">
                    {tags.map((tag) => (
                      <div key={tag} className="tag-badge">
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="tag-remove"
                          type="button"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="tag-input-group">
                    <input
                      className="tag-input"
                      placeholder="Thêm tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag(newTag);
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="tag-add-btn"
                      onClick={() => addTag(newTag)}
                    >
                      +
                    </button>
                  </div>
                  <p className="field-hint">Thêm tối đa 5 tags để phân loại câu hỏi của bạn</p>
                </div>                {/* Submit Button */}
                <div className="button-group">
                  <button type="button" onClick={handleSubmit} className="btn-primary">
                    Đăng câu hỏi
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => navigate('/')}
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="sidebar">
          {/* Tips */}
          <div className="question-card">
            <div className="card-header">
              <h3 className="card-title">Mẹo viết câu hỏi hay</h3>
            </div>
            <div className="card-content">
              <div className="tips-list">
                <div className="tip-item">
                  <h4>1. Tiêu đề rõ ràng</h4>
                  <p>Tóm tắt vấn đề trong 1-2 câu</p>
                </div>
                <div className="tip-item">
                  <h4>2. Mô tả chi tiết</h4>
                  <p>Giải thích bối cảnh và những gì bạn đã thử</p>
                </div>
                <div className="tip-item">
                  <h4>3. Thêm code mẫu</h4>
                  <p>Chia sẻ code để mọi người dễ hiểu</p>
                </div>
                <div className="tip-item">
                  <h4>4. Sử dụng tags</h4>
                  <p>Giúp phân loại và tìm kiếm dễ dàng</p>
                </div>
              </div>
            </div>
          </div>

          {/* Popular Tags */}
          <div className="question-card">
            <div className="card-header">
              <h3 className="card-title">Tags phổ biến</h3>
            </div>
            <div className="card-content">
              <div className="popular-tags">
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    className="popular-tag"
                    onClick={() => addTag(tag)}
                    type="button"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostQuestionPage;
