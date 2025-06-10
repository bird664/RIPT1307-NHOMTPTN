import { message } from 'antd';
import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'umi';
import './auth.css';

interface LoginPageProps {
  setUser: React.Dispatch<React.SetStateAction<any>>;
}

const LoginPage: React.FC<LoginPageProps> = ({ setUser }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [isLoading, setIsLoading] = useState(false);

  // Login form data
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  // Register form data
  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    role: '',
    studentId: '',
    department: '',
    password: '',
    confirmPassword: '',
  });

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/login',
        {
          email: loginData.email,
          password: loginData.password,
        },
      );

      message.success('Đăng nhập thành công');
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      navigate('/');
    } catch (error) {
      message.error('Đăng nhập không thành công');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerData.password !== registerData.confirmPassword) {
      message.error('Mật khẩu xác nhận không khớp');
      return;
    }

    setIsLoading(true);

    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        username: registerData.fullName,
        email: registerData.email,
        password: registerData.password,
        role: registerData.role,
        studentId: registerData.studentId,
        department: registerData.department,
      });

      message.success('Đăng ký thành công');
      setActiveTab('login');
      setRegisterData({
        fullName: '',
        email: '',
        role: '',
        studentId: '',
        department: '',
        password: '',
        confirmPassword: '',
      });
    } catch (error) {
      message.error('Đăng ký không thành công');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-header">
          <a href="/" className="auth-logo">
            StudyForum
          </a>
          <p className="auth-subtitle">Diễn đàn học thuật sinh viên</p>
        </div>

        <div className="auth-tabs">
          <div className="tabs-list">
            <button
              className={`tab-trigger ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => setActiveTab('login')}
              type="button"
            >
              Đăng nhập
            </button>
            <button
              className={`tab-trigger ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => setActiveTab('register')}
              type="button"
            >
              Đăng ký
            </button>
          </div>

          {/* Login Tab */}
          <div className={activeTab === 'login' ? '' : 'hidden'}>
            <div className="auth-card">
              <div className="card-header">
                <h2 className="card-title">Đăng nhập</h2>
                <p className="card-description">Nhập thông tin để truy cập tài khoản của bạn</p>
              </div>
              <div className="card-content">
                <form onSubmit={handleLogin} className="auth-form">
                  <div className="form-group">
                    <label className="form-label" htmlFor="email">Email</label>
                    <input
                      id="email"
                      type="email"
                      className="form-input"
                      placeholder="your.email@university.edu.vn"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="password">Mật khẩu</label>
                    <input
                      id="password"
                      type="password"
                      className="form-input"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex-between">
                    <a href="/forgot-password" className="auth-link">
                      Quên mật khẩu?
                    </a>
                  </div>
                  <button type="submit" className="btn-primary" disabled={isLoading}>
                    {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Register Tab */}
          <div className={activeTab === 'register' ? '' : 'hidden'}>
            <div className="auth-card">
              <div className="card-header">
                <h2 className="card-title">Đăng ký tài khoản</h2>
                <p className="card-description">Tạo tài khoản mới để tham gia diễn đàn</p>
              </div>
              <div className="card-content">
                <form onSubmit={handleRegister} className="auth-form">
                  <div className="form-group">
                    <label className="form-label" htmlFor="fullName">Họ và tên</label>
                    <input
                      id="fullName"
                      className="form-input"
                      placeholder="Nguyễn Văn A"
                      value={registerData.fullName}
                      onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="registerEmail">Email</label>
                    <input
                      id="registerEmail"
                      type="email"
                      className="form-input"
                      placeholder="your.email@university.edu.vn"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="role">Vai trò</label>
                    <select
                      id="role"
                      className="form-select"
                      value={registerData.role}
                      onChange={(e) => setRegisterData({ ...registerData, role: e.target.value })}
                      required
                    >
                      <option value="">Chọn vai trò</option>
                      <option value="student">Sinh viên</option>
                      <option value="teacher">Giảng viên</option>
                    </select>
                  </div>
                  {registerData.role === "student" && (
                    <div className="form-group">
                      <label className="form-label" htmlFor="studentId">Mã sinh viên</label>
                      <input
                        id="studentId"
                        className="form-input"
                        placeholder="20210001"
                        value={registerData.studentId}
                        onChange={(e) => setRegisterData({ ...registerData, studentId: e.target.value })}
                        required
                      />
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label" htmlFor="department">Khoa/Bộ môn</label>
                    <select
                      id="department"
                      className="form-select"
                      value={registerData.department}
                      onChange={(e) => setRegisterData({ ...registerData, department: e.target.value })}
                      required
                    >
                      <option value="">Chọn khoa/bộ môn</option>
                      <option value="cntt">Công nghệ thông tin</option>
                      <option value="dien-tu">Điện tử viễn thông</option>
                      <option value="co-khi">Cơ khí</option>
                      <option value="kinh-te">Kinh tế</option>
                      <option value="ngoai-ngu">Ngoại ngữ</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="registerPassword">Mật khẩu</label>
                    <input
                      id="registerPassword"
                      type="password"
                      className="form-input"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                    <input
                      id="confirmPassword"
                      type="password"
                      className="form-input"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary" disabled={isLoading}>
                    {isLoading ? "Đang đăng ký..." : "Đăng ký"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
