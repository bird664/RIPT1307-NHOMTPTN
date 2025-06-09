import { Button, Form, Input, message, Select } from 'antd';
import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'umi';

const { Option } = Select;

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        username,
        email,
        password,
        role,
      });
      message.success('Đăng ký thành công');
      navigate('/login');
    } catch (error) {
      message.error('Đăng ký không thành công');
    }
  };

  return (
    <div>
      <h2>Đăng ký</h2>
      <Form onFinish={handleRegister}>
        <Form.Item label="Tên người dùng" required>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Item>
        <Form.Item label="Email" required>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </Form.Item>
        <Form.Item label="Mật khẩu" required>
          <Input.Password
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Item>
        <Form.Item label="Vai trò" required>
          <Select value={role} onChange={setRole}>
            <Option value="student">Sinh viên</Option>
            <Option value="teacher">Giảng viên</Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Đăng ký
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default RegisterPage;
