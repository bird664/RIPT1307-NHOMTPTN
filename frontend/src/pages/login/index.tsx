import { Button, Form, Input, message } from 'antd';
import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'umi';

interface LoginPageProps {
  setUser: React.Dispatch<React.SetStateAction<any>>; // Nhận setUser từ IndexPage
}

const LoginPage: React.FC<LoginPageProps> = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/login',
        {
          email,
          password,
        },
      );

      message.success('Đăng nhập thành công');

      // Cập nhật thông tin người dùng vào state của component cha
      setUser(response.data);

      localStorage.setItem('user', JSON.stringify(response.data));

      navigate('/');
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Đăng nhập không thành công');
      }
    }
  };

  return (
    <div>
      <h2>Đăng nhập</h2>
      <Form onFinish={handleLogin}>
        <Form.Item label="Email" required>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </Form.Item>
        <Form.Item label="Mật khẩu" required>
          <Input.Password
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default LoginPage;

