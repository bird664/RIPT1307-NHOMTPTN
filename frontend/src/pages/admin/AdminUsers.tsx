import React, { useEffect, useState } from 'react';
import { Table, Button, Popconfirm, message, Modal, Input } from 'antd';
import axios from 'axios';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

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

  return (
    <>
      <Table
        rowKey="_id"
        dataSource={users}
        columns={[
          { title: 'Tên', dataIndex: 'username' },
          { title: 'Email', dataIndex: 'email' },
          { title: 'Vai trò', dataIndex: 'role' },
          {
            title: 'Hành động',
            render: (_, record) => (
              <>
                <Popconfirm title="Xóa người dùng này?" onConfirm={() => handleDelete(record._id)}>
                  <Button danger>Xóa</Button>
                </Popconfirm>
                <Popconfirm title="Khóa tài khoản này?" onConfirm={() => handleLock(record._id)}>
                  <Button type="default">Khóa</Button>
                </Popconfirm>
                <Popconfirm title="Mở khóa tài khoản này?" onConfirm={() => handleUnlock(record._id)}>
                  <Button type="default">Mở khóa</Button>
                </Popconfirm>
                <Button onClick={() => showResetPasswordModal(record._id)}>Cấp lại mật khẩu</Button>
              </>
            ),
          },
        ]}
      />
      <Modal
        open={!!resetUserId}
        title="Cấp lại mật khẩu"
        onCancel={() => setResetUserId(null)}
        onOk={handleResetPassword}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <Input.Password
          placeholder="Nhập mật khẩu mới"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
        />
      </Modal>
    </>
  );
};

export default AdminUsers;
