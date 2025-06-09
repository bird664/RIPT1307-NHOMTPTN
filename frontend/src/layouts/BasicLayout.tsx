import {
  FileTextOutlined,
  HomeOutlined,
  LoginOutlined,
  LogoutOutlined,
  SearchOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { Button, Col, Layout, Menu, Row } from 'antd';
import React, { ReactNode } from 'react';
import { Link } from 'umi';

const { Header, Sider, Content, Footer } = Layout;

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
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#001529', padding: '0 20px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <div style={{ color: 'white', fontSize: 24, padding: '16px' }}>
              Diễn đàn Hỏi Đáp Sinh Viên
            </div>
          </Col>
          <Col>
            {user ? (
              <div style={{ color: 'white' }}>
                <span>Chào, {user.username}</span>
                <Button
                  type="link"
                  style={{ color: 'white' }}
                  onClick={handleLogout}
                >
                  <LogoutOutlined /> Đăng xuất
                </Button>
              </div>
            ) : (
              <>
                <Button type="link" style={{ color: 'white' }}>
                  <Link to="/login">
                    <LoginOutlined /> Đăng nhập
                  </Link>
                </Button>
                <Button type="link" style={{ color: 'white' }}>
                  <Link to="/register">
                    <UserAddOutlined /> Đăng ký
                  </Link>
                </Button>
              </>
            )}
          </Col>
        </Row>
      </Header>

      <Layout style={{ padding: '20px 24px' }}>
        <Sider width={250} className="site-layout-background" theme="dark">
          <Menu
            mode="inline"
            defaultSelectedKeys={['1']}
            style={{ height: '100%', borderRight: 0 }}
          >
            <Menu.Item key="1" icon={<HomeOutlined />}>
              <Link to="/">Trang chủ</Link>
            </Menu.Item>
            <Menu.Item key="2" icon={<FileTextOutlined />}>
              <Link to="/post-question">Tạo câu hỏi</Link>
            </Menu.Item>
            <Menu.Item key="3" icon={<SearchOutlined />}>
              <Link to="/search">Tìm kiếm câu hỏi</Link>
            </Menu.Item>
          </Menu>
        </Sider>

        <Layout style={{ padding: '0 24px 24px' }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              backgroundColor: '#fff',
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>

      <Footer
        style={{ textAlign: 'center', background: '#f0f2f5', padding: '10px' }}
      >
        <p>© 2025 Diễn đàn Hỏi Đáp Sinh Viên. All rights reserved.</p>
      </Footer>
    </Layout>
  );
};

export default BasicLayout;
