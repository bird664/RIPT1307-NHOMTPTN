import {
  LoginOutlined,
  LogoutOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { Button, Col, Layout, Row } from 'antd';
import React, { ReactNode } from 'react';
import { Link } from 'umi';
import './BasicLayout.css';

const { Header, Content, Footer } = Layout;

interface BasicLayoutProps {
  children: ReactNode;
  user: any;
}

const BasicLayout: React.FC<BasicLayoutProps> = ({ children, user }) => {
  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login'; // Điều hướng về trang đăng nhập
  };
  return (
    <Layout className="layout-container">
      <Header className="header-container">
        <Row justify="space-between" align="middle" className="header-row">
          <Col className="header-left">
            <div className="logo">
              StudyForum
            </div>
            <Link to="/" style={{ color: '#000000' }}>Trang chủ</Link>
            <Link to="/post-question" style={{ color: '#000000' }}>Đặt câu hỏi</Link>
            <Link to="/search" style={{ color: '#000000' }}>Tìm kiếm câu hỏi</Link>
            {user && user.role === 'admin' && (
              <Link to="/admin" style={{ color: '#000000' }}>Quản trị viên</Link>
            )}
          </Col>
          <Col>
            {user ? (
              <div className="user-info">
                <span className="user-greeting">Chào, {user.username}</span>
                <Button
                  type="link"
                  className="logout-button"
                  onClick={handleLogout}
                >
                  <LogoutOutlined /> Đăng xuất
                </Button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Button type="link" className="auth-button">
                  <Link to="/login">
                    <LoginOutlined /> Đăng nhập
                  </Link>
                </Button>
                <Button type="link" className="auth-button">
                  <Link to="/register">
                    <UserAddOutlined /> Đăng ký
                  </Link>
                </Button>
              </div>
            )}
          </Col>
        </Row>
      </Header>      
      <Layout className="main-layout">
        <Layout className="content-layout">
          <Content className="main-content">
            {children}
          </Content>
        </Layout>
      </Layout>

      <Footer className="footer-container">
        <p className="footer-text">© 2025 Diễn đàn Hỏi Đáp Sinh Viên. All rights reserved.</p>
      </Footer>
    </Layout>
  );
};

export default BasicLayout;
