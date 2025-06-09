import React, { useState } from 'react';
import { Input, List, Button, message } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Search } = Input;

const QuestionList: React.FC = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [tags] = useState<string[]>(['Math', 'Physics', 'ComputerScience', 'Engineering', 'Business']);  // Các tag có sẵn
  const navigate = useNavigate();

  // Hàm cập nhật giá trị từ khóa khi người dùng nhập
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Hàm tìm kiếm khi nhấn Enter hoặc click vào Search
  const handleSearch = async (value: string) => {
    if (!value.trim()) {
      message.error('Vui lòng nhập từ khóa tìm kiếm');
      return;
    }

    console.log("Searching for:", value);  // Debug log

    try {
      const response = await axios.get(`http://localhost:5000/api/questions/search?search=${value}`);
      console.log("Search result:", response.data);  // Debug log để xem dữ liệu trả về
      setQuestions(response.data.questions);
    } catch (error) {
      message.error('Lỗi khi tìm kiếm');
      console.error('Error during search:', error);  // Log lỗi để kiểm tra
    }
  };

  // Hàm lọc theo tag
  const handleFilterByTag = async (tag: string) => {
    console.log("Filtering by tag:", tag);  // Debug log để kiểm tra tag

    try {
      const response = await axios.get(`http://localhost:5000/api/questions/tags/${tag}`);
      console.log("Filtered questions:", response.data);  // Debug log để kiểm tra kết quả trả về
      setQuestions(response.data.questions);
    } catch (error) {
      message.error('Lỗi khi lọc theo tag');
      console.error('Error during tag filter:', error);  // Log lỗi để kiểm tra
    }
  };

  return (
    <div>
      {/* Tìm kiếm */}
      <Search
        placeholder="Tìm câu hỏi"
        value={searchQuery}  // Đồng bộ giá trị với state searchQuery
        onSearch={handleSearch}  // Khi nhấn Enter hoặc click vào nút tìm kiếm
        onChange={handleInputChange}  // Cập nhật giá trị tìm kiếm khi người dùng nhập
        style={{ width: 300, marginBottom: 20 }}
      />

      {/* Bộ lọc theo tag */}
      <div style={{ marginBottom: 20 }}>
        {tags.map((tag) => (
          <Button key={tag} onClick={() => handleFilterByTag(tag)} style={{ margin: 5 }}>
            {tag}
          </Button>
        ))}
      </div>

      {/* Danh sách câu hỏi */}
      <List
        itemLayout="horizontal"
        dataSource={questions}
        locale={{ emptyText: 'Không tìm thấy câu hỏi nào phù hợp.' }}
        renderItem={(item) => (
          <List.Item
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/questions/${item._id}`)}
          >
            <List.Item.Meta
              title={item.title}
              description={`Được đăng bởi: ${item.username} | Tags: ${item.tags.join(', ')}`}
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default QuestionList;
