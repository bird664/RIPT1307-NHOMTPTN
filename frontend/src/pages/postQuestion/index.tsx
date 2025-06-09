import { Button, Form, Input, message, Select } from 'antd';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'umi';

const { TextArea } = Input;

const PostQuestionPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null); // Lưu thông tin người dùng
  const navigate = useNavigate();

  // Kiểm tra người dùng đã đăng nhập
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Nếu có thông tin người dùng trong localStorage, lưu vào state
    } else {
      message.error('Bạn cần đăng nhập để đăng bài');
      navigate('/login'); // Điều hướng về trang đăng nhập nếu chưa đăng nhập
    }
  }, [navigate]);

  const handlePost = async () => {
    if (!title || !content || tags.length === 0) {
      message.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (!user) {
      message.error('Bạn cần đăng nhập để đăng bài');
      return;
    }

    try {
      // Gửi bài viết lên backend, kèm theo thông tin người dùng
      const response = await axios.post('http://localhost:5000/api/questions', {
        title,
        content,
        tags,
        userId: user._id,
        username: user.username,
      });

      // Sử dụng response để lấy thông tin bài viết mới
      const newQuestion = response.data.question;
      console.log('Bài viết mới:', newQuestion);

      message.success('Đăng bài thành công');
      navigate('/'); // Điều hướng đến trang danh sách bài viết
    } catch (error) {
      message.error('Đăng bài không thành công');
    }
  };

  return (
    <div>
      <h2>Đăng bài mới</h2>
      <Form onFinish={handlePost}>
        <Form.Item label="Tiêu đề" required>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </Form.Item>
        <Form.Item label="Nội dung" required>
          <TextArea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
          />
        </Form.Item>
        <Form.Item label="Tag" required>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Chọn các tag"
            value={tags}
            onChange={(value) => setTags(value)}
          >
            <Select.Option value="Math">Toán học</Select.Option>
            <Select.Option value="Physics">Vật lý</Select.Option>
            <Select.Option value="ComputerScience">Tin học</Select.Option>
            <Select.Option value="Engineering">Kỹ thuật</Select.Option>
            <Select.Option value="Business">Kinh doanh</Select.Option>
            {/* Thêm các tag khác ở đây */}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Đăng bài
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default PostQuestionPage;
