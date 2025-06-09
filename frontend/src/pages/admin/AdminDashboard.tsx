import React from 'react';
import { Tabs, Card } from 'antd';
import AdminPosts from './AdminPosts';
import AdminUsers from './AdminUsers';

const { TabPane } = Tabs;

const AdminDashboard: React.FC = () => (
  <Card title="Trang quản trị viên">
    <Tabs defaultActiveKey="posts">
      <TabPane tab="Quản lý bài đăng" key="posts">
        <AdminPosts />
      </TabPane>
      <TabPane tab="Quản lý người dùng" key="users">
        <AdminUsers />
      </TabPane>
    </Tabs>
  </Card>
);

export default AdminDashboard;