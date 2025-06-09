import React, { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import BasicLayout from '../layouts/BasicLayout';
import HomePage from './home';
import LoginPage from './login';
import PostQuestionPage from './postQuestion'; // Đảm bảo rằng bạn đã import đúng
import RegisterPage from './register';
import QuestionDetailPage from './questions';
import QuestionList from './search';
import AdminDashboard from './admin/AdminDashboard';

const IndexPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);

  // Kiểm tra thông tin người dùng khi tải lại trang
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Nếu có thông tin người dùng trong localStorage, lưu vào state
    }
  }, []);

  return (
    <BasicLayout user={user}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage setUser={setUser} />} />
        <Route path="/post-question" element={<PostQuestionPage />} />
        <Route path="questions/:id" element={<QuestionDetailPage />} />
        <Route path="/search" element={<QuestionList />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Routes>
    </BasicLayout>
  );
};

export default IndexPage;
