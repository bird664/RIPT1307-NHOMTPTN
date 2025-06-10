import React, { useEffect, useState } from 'react';
import { Table, Button, message, Modal, Input, Avatar, Card, Dropdown, Menu } from 'antd';
import { SearchOutlined, PlusOutlined, MoreOutlined, EditOutlined, MailOutlined, LockOutlined, UnlockOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';
import './AdminUsers.css';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    const res = await axios.get('http://localhost:5000/api/auth/users');
    setUsers(res.data.users);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id: string) => {
    await axios.delete(`http://localhost:5000/api/auth/users/${id}`);
    message.success('Đã xóa người dùng');
    fetchUsers();
  };

  const handleLock = async (id: string) => {
    await axios.put(`http://localhost:5000/api/auth/users/${id}/lock`);
    message.success('Tài khoản đã được khóa');
    fetchUsers();
  };

  const handleUnlock = async (id: string) => {
    await axios.put(`http://localhost:5000/api/auth/users/${id}/unlock`);
    message.success('Tài khoản đã được mở khóa');
    fetchUsers();
  };

  // Hiển thị modal nhập mật khẩu mới
  const showResetPasswordModal = (id: string) => {
    setResetUserId(id);
    setNewPassword('');
  };

  // Xác nhận cấp lại mật khẩu
  const handleResetPassword = async () => {
    if (!newPassword) {
      message.error('Vui lòng nhập mật khẩu mới');
      return;
    }
    await axios.put(`http://localhost:5000/api/auth/users/${resetUserId}/reset-password`, { newPassword });
    message.success('Mật khẩu đã được cấp lại');
    setResetUserId(null);
    setNewPassword('');
    fetchUsers();
  };
  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div className="admin-users-container">
      <div className="admin-users-content">
        {/* Header */}
        <div className="admin-users-header">
          <h2 className="admin-users-title">Quản lý người dùng</h2>
          <div className="admin-users-actions">
            <div className="admin-users-search">
              <SearchOutlined className="admin-users-search-icon" />
              <Input
                placeholder="Tìm kiếm người dùng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="admin-users-search-input"
              />
            </div>
            <Button type="primary" className="admin-users-add-btn">
              <PlusOutlined className="admin-users-add-icon" />
              Thêm người dùng
            </Button>
          </div>
        </div>

        {/* Users Table */}
        <Card className="admin-users-table-card">
          <Table
            className="admin-users-table"
            rowKey="_id"
            dataSource={filteredUsers}
            columns={[
              {
                title: 'Người dùng',
                key: 'user',
                render: (_, record) => (
                  <div className="user-info">
                    <Avatar size={32} icon={<UserOutlined />} className="user-avatar">
                      {record.username?.charAt(0).toUpperCase()}
                    </Avatar>
                    <div className="user-details">
                      <div className="user-name">{record.username}</div>
                      <div className="user-id">
                        ID: {record._id?.slice(-6)}
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                title: 'Email',
                dataIndex: 'email',
                key: 'email',
              },
              {
                title: 'Vai trò',
                dataIndex: 'role',
                key: 'role',
                render: (role) => (
                  <span className={`role-badge ${role === 'admin' ? 'admin' : role === 'teacher' ? 'teacher' : 'student'}`}>
                    {role === 'admin' ? 'Quản trị viên' : role === 'teacher' ? 'Giảng viên' : 'Sinh viên'}
                  </span>
                ),
              },
              {
                title: 'Trạng thái',
                key: 'status',
                render: (_, record) => (
                  <div className={`status-badge ${record.isLocked ? 'locked' : 'active'}`}>
                    <span className={`status-dot ${record.isLocked ? 'locked' : 'active'}`}></span>
                    {record.isLocked ? 'Bị khóa' : 'Hoạt động'}
                  </div>
                ),
              },
              {
                title: 'Hành động',
                key: 'actions',
                render: (_, record) => (
                  <div className="actions-dropdown">
                    <Dropdown
                      overlay={
                        <Menu>
                          <Menu.Item key="edit" icon={<EditOutlined />}>
                            Chỉnh sửa
                          </Menu.Item>
                          <Menu.Item
                            key="reset-password"
                            icon={<MailOutlined />}
                            onClick={() => showResetPasswordModal(record._id)}
                          >
                            Cấp lại mật khẩu
                          </Menu.Item>
                          {record.isLocked ? (
                            <Menu.Item
                              key="unlock"
                              icon={<UnlockOutlined />}
                              onClick={() => handleUnlock(record._id)}
                            >
                              Mở khóa
                            </Menu.Item>
                          ) : (
                            <Menu.Item
                              key="lock"
                              icon={<LockOutlined />}
                              onClick={() => handleLock(record._id)}
                            >
                              Khóa tài khoản
                            </Menu.Item>
                          )}
                          <Menu.Divider />
                          <Menu.Item
                            key="delete"
                            icon={<DeleteOutlined />}
                            danger
                            onClick={() => {
                              Modal.confirm({
                                title: 'Xóa người dùng này?',
                                content: 'Hành động này không thể hoàn tác.',
                                okText: 'Xóa',
                                cancelText: 'Hủy',
                                okType: 'danger',
                                onOk: () => handleDelete(record._id)
                              });
                            }}
                          >
                            Xóa tài khoản
                          </Menu.Item>
                        </Menu>
                      }
                      trigger={['click']}
                    >
                      <Button type="text" size="small" className="actions-btn">
                        <MoreOutlined className="actions-icon" />
                      </Button>
                    </Dropdown>
                  </div>
                ),
              },
            ]}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} người dùng`,
              className: 'pagination-wrapper'
            }}
            scroll={{ x: 800 }}
          />
        </Card>

        {/* Reset Password Modal */}
        <Modal
          open={!!resetUserId}
          title="Cấp lại mật khẩu"
          onCancel={() => setResetUserId(null)}
          onOk={handleResetPassword}
          okText="Xác nhận"
          cancelText="Hủy"
          className="password-modal"
        >
          <div className="password-modal-content">
            <p className="password-modal-description">
              Nhập mật khẩu mới cho người dùng này:
            </p>
            <Input.Password
              placeholder="Nhập mật khẩu mới"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="password-input"
            />
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default AdminUsers;
