import { Button, List, message, Spin } from 'antd';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'umi';  // Import useNavigate

const HomePage: React.FC = () => {
  const [questions, setQuestions] = useState<any[]>([]);  // Lưu danh sách câu hỏi
  const [loading, setLoading] = useState<boolean>(true);  // Trạng thái loading
  const navigate = useNavigate();  // Sử dụng useNavigate để điều hướng

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/questions');
        setQuestions(response.data.questions);  // Lưu danh sách câu hỏi vào state
        setLoading(false);  // Tắt loading khi lấy dữ liệu thành công
      } catch (error) {
        message.error('Không thể tải danh sách câu hỏi');
        setLoading(false);  // Dừng trạng thái loading nếu có lỗi
      }
    };

    fetchQuestions();
  }, []);  // Gọi khi trang được load

  if (loading) {
    return <Spin tip="Đang tải..." />;  // Hiển thị loading nếu đang tải
  }

  return (
    <div>
      <h2>Danh sách câu hỏi</h2>
      <Button
        type="primary"
        onClick={() => navigate('/post-question')}  // Sử dụng navigate để điều hướng
        style={{ marginBottom: '20px' }}
      >
        Đăng câu hỏi mới
      </Button>
      <List
        itemLayout="horizontal"
        dataSource={questions}
        renderItem={(question) => (
          <List.Item
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/questions/${question._id}`)} // Thêm sự kiện click cho cả item
          >
            <List.Item.Meta
              title={
                <span
                  style={{ color: '#1677ff', textDecoration: 'underline' }}
                  onClick={e => {
                    e.stopPropagation(); // Ngăn sự kiện nổi bọt để không gọi lại onClick của List.Item
                    navigate(`/questions/${question._id}`);
                  }}
                >
                  {question.title}
                </span>
              }
              description={`Được đăng bởi: ${question.username} | Tags: ${question.tags.join(', ')}`}
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default HomePage;
