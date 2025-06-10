import React, { useState, useEffect } from 'react';
import { Tabs, Card, Table, Button, Input, Modal, Select, Dropdown, Menu, message } from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  MoreOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  MailOutlined,
  LockOutlined,
  UnlockOutlined,
  MessageOutlined,
  UserOutlined,
  FilterOutlined
} from '@ant-design/icons';
import axios from 'axios';
import './AdminDashboard.css';

const { TabPane } = Tabs;
const { Option } = Select;

const AdminDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [isAddUserModalVisible, setIsAddUserModalVisible] = useState(false);
  const [isResetPasswordModalVisible, setIsResetPasswordModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetUserId, setResetUserId] = useState<string | null>(null); const [newPassword, setNewPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [settings, setSettings] = useState({
    emailNotifications: {
      newPosts: true,
      newComments: true,
      violations: true
    },
    forumSettings: {
      maxTags: 5,
      minVotes: -5,
      autoDeleteDays: 365
    }
  });
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalUsers: 0,
    todayPosts: 0,
    totalTeachers: 0
  });
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: '',
    department: ''
  });
  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/auth/users');
      setUsers(response.data.users || []); // Fix: add fallback to empty array
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };
  // Fetch posts from API
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/questions');
      setPosts(response.data.questions || []); // Fix: use response.data.questions and fallback to empty array
    } catch (error) {
      console.error('Error fetching posts:', error);
      message.error('Không thể tải danh sách bài đăng');
    } finally {
      setLoading(false);
    }
  };
  // Calculate stats from real data
  const calculateStats = () => {
    const totalUsers = (users || []).length;
    const totalTeachers = (users || []).filter(user => user.role === 'teacher').length;
    const totalPosts = (posts || []).length;

    // Calculate today's posts
    const today = new Date().toDateString();
    const todayPosts = (posts || []).filter(post => {
      const postDate = new Date(post.createdAt || post.date).toDateString();
      return postDate === today;
    }).length;

    setStats({
      totalPosts,
      totalUsers,
      todayPosts,
      totalTeachers
    });
  };

  useEffect(() => {
    fetchUsers();
    fetchPosts();
  }, []);

  useEffect(() => {
    if (users.length > 0 || posts.length > 0) {
      calculateStats();
    }
  }, [users, posts]);  // Stats data from real API data
  const statsCards = [
    {
      title: 'Tổng bài đăng',
      value: stats.totalPosts.toString(),
      change: `${stats.totalPosts} bài đăng`,
      positive: true,
      icon: MessageOutlined
    },
    {
      title: 'Người dùng',
      value: stats.totalUsers.toString(),
      change: `${stats.totalUsers} người dùng`,
      positive: true,
      icon: UserOutlined
    },
    {
      title: 'Bài đăng hôm nay',
      value: stats.todayPosts.toString(),
      change: `${stats.todayPosts} bài đăng mới`,
      positive: true,
      icon: MessageOutlined
    },
    {
      title: 'Giảng viên',
      value: stats.totalTeachers.toString(),
      change: `${stats.totalTeachers} giảng viên`,
      positive: true,
      icon: UserOutlined
    }];

  const filteredPosts = (posts || []).filter(post =>
    post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = (users || []).filter(user =>
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const validateUserForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!newUser.name.trim()) {
      newErrors.name = 'Vui lòng nhập họ tên';
    }

    if (!newUser.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(newUser.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!newUser.role) {
      newErrors.role = 'Vui lòng chọn vai trò';
    }

    if (!newUser.department) {
      newErrors.department = 'Vui lòng chọn khoa/bộ môn';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddUser = async () => {
    if (!validateUserForm()) {
      return;
    }

    try {
      setLoading(true);
      await axios.post('http://localhost:5000/api/auth/register', {
        username: newUser.name,
        email: newUser.email,
        password: 'defaultPassword123', // You might want to generate a random password
        role: newUser.role,
        department: newUser.department
      });
      setIsAddUserModalVisible(false);
      setNewUser({ name: '', email: '', role: '', department: '' });
      setErrors({});
      message.success('Đã thêm người dùng mới');
      fetchUsers(); // Refresh users list
    } catch (error) {
      console.error('Error adding user:', error);
      message.error('Không thể thêm người dùng mới');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    Modal.confirm({
      title: 'Xóa bài đăng này?',
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        try {
          await axios.delete(`http://localhost:5000/api/questions/${id}`);
          message.success('Đã xóa bài đăng');
          fetchPosts(); // Refresh posts list
        } catch (error) {
          console.error('Error deleting post:', error);
          message.error('Không thể xóa bài đăng');
        }
      }
    });
  };

  const handleDeleteUser = async (id: string) => {
    Modal.confirm({
      title: 'Xóa người dùng này?',
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        try {
          await axios.delete(`http://localhost:5000/api/auth/users/${id}`);
          message.success('Đã xóa người dùng');
          fetchUsers(); // Refresh users list
        } catch (error) {
          console.error('Error deleting user:', error);
          message.error('Không thể xóa người dùng');
        }
      }
    });
  };
  const handleToggleUserStatus = async (id: string, currentStatus: string) => {
    try {
      const endpoint = currentStatus === 'active'
        ? `http://localhost:5000/api/auth/users/${id}/lock`
        : `http://localhost:5000/api/auth/users/${id}/unlock`;

      await axios.put(endpoint);
      message.success('Đã cập nhật trạng thái người dùng');
      fetchUsers(); // Refresh users list
    } catch (error) {
      console.error('Error updating user status:', error);
      message.error('Không thể cập nhật trạng thái người dùng');
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      setErrors({ password: 'Vui lòng nhập mật khẩu mới' });
      return;
    }

    if (newPassword.length < 6) {
      setErrors({ password: 'Mật khẩu phải có ít nhất 6 ký tự' });
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/auth/users/${resetUserId}/reset-password`, {
        newPassword: newPassword
      });

      setIsResetPasswordModalVisible(false);
      setResetUserId(null);
      setNewPassword('');
      setErrors({});
      message.success('Đã đặt lại mật khẩu thành công');
    } catch (error) {
      console.error('Error resetting password:', error);
      message.error('Không thể đặt lại mật khẩu');
    }
  };

  const handleToggleEmailNotification = (type: string) => {
    setSettings(prev => ({
      ...prev,
      emailNotifications: {
        ...prev.emailNotifications,
        [type]: !prev.emailNotifications[type as keyof typeof prev.emailNotifications]
      }
    }));
    message.success('Đã cập nhật cài đặt thông báo');
  };

  const handleSaveForumSettings = () => {
    // Here you would typically save to API
    message.success('Đã lưu cài đặt diễn đàn');
  };

  const handleForumSettingChange = (field: string, value: number) => {
    setSettings(prev => ({
      ...prev,
      forumSettings: {
        ...prev.forumSettings,
        [field]: value
      }
    }));
  };

  return (
    <div className="admin-dashboard-container">
      <Tabs
        activeKey={selectedTab}
        onChange={setSelectedTab}
        className="admin-tabs"
      >        <TabPane tab="Tổng quan" key="overview">
          <div className="overview-stats">
            {statsCards.map((stat, index) => (
              <Card key={index} className="stat-card">
                <div className="stat-card-header">
                  <h3 className="stat-card-title">{stat.title}</h3>
                  <stat.icon className="stat-card-icon" />
                </div>
                <div className="stat-card-value">{stat.value}</div>
                <p className={`stat-card-change ${stat.positive ? 'positive' : 'negative'}`}>
                  {stat.change}
                </p>
              </Card>
            ))}
          </div>

          <Card className="recent-activity-card">
            <div className="recent-activity-header">
              <h3 className="recent-activity-title">Hoạt động gần đây</h3>
            </div>            <div className="activity-list">
              {(posts || []).slice(0, 5).map((post) => (
                <div key={post._id} className="activity-item">
                  <div className="activity-avatar">
                    {post.username?.charAt(0)}
                  </div>
                  <div className="activity-content">
                    <p className="activity-text">
                      <strong>{post.username}</strong> đã đăng câu hỏi mới
                    </p>
                    <p className="activity-description">{post.title}</p>
                  </div>
                  <div className="activity-time">
                    {new Date(post.createdAt || post.date).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              ))}
              {(!posts || posts.length === 0) && (
                <div className="activity-item">
                  <div className="activity-content">
                    <p className="activity-text">Chưa có hoạt động nào</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabPane>

        <TabPane tab="Quản lý bài đăng" key="posts">
          <div className="posts-header">
            <h2 className="posts-title">Quản lý bài đăng</h2>
            <div className="posts-actions">
              <div className="posts-search">
                <SearchOutlined className="posts-search-icon" />
                <Input
                  placeholder="Tìm kiếm bài đăng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="posts-search-input"
                />
              </div>              <Button className="posts-filter-btn">
                <FilterOutlined style={{ fontSize: '14px', marginRight: '8px' }} />
                Lọc
              </Button>
            </div>
          </div>          <Card className="posts-table-card">
            <Table
              dataSource={filteredPosts}
              rowKey="_id"
              loading={loading}
              columns={[
                {
                  title: 'Tiêu đề',
                  dataIndex: 'title',
                  key: 'title',
                  render: (title) => (
                    <div className="post-title-cell">
                      <div className="post-title-truncate">{title}</div>
                    </div>
                  ),
                },
                {
                  title: 'Tác giả',
                  key: 'author',
                  render: (_, record) => (
                    <div className="post-author-info">
                      <div className="post-author-avatar">
                        {record.username?.charAt(0)}
                      </div>
                      <div className="post-author-details">
                        <div className="post-author-name">{record.username}</div>
                      </div>
                    </div>
                  ),
                },
                {
                  title: 'Ngày đăng',
                  dataIndex: 'date',
                  key: 'date',
                  render: (date) => new Date(date).toLocaleDateString('vi-VN'),
                },
                {
                  title: 'Tags',
                  dataIndex: 'tags',
                  key: 'tags',
                  render: (tags) => (
                    <div className="post-tags">
                      {tags?.map((tag: string) => (
                        <span key={tag} className="post-tag">{tag}</span>
                      ))}
                    </div>
                  ),
                },
                {
                  title: 'Votes',
                  dataIndex: 'votes',
                  key: 'votes',
                  render: (votes) => votes || 0,
                },
                {
                  title: 'Bình luận',
                  dataIndex: 'comments',
                  key: 'comments',
                  render: (comments) => comments?.length || 0,
                },
                {
                  title: 'Hành động',
                  key: 'actions',
                  render: (_, record) => (
                    <Dropdown
                      overlay={
                        <Menu>
                          <Menu.Item key="view" icon={<EyeOutlined />}>
                            Xem chi tiết
                          </Menu.Item>
                          <Menu.Item key="edit" icon={<EditOutlined />}>
                            Chỉnh sửa
                          </Menu.Item>
                          <Menu.Item
                            key="delete"
                            icon={<DeleteOutlined />}
                            danger
                            onClick={() => handleDeletePost(record._id)}
                          >
                            Xóa
                          </Menu.Item>
                        </Menu>
                      }
                      trigger={['click']}
                    >
                      <Button type="text" size="small">
                        <MoreOutlined />
                      </Button>
                    </Dropdown>
                  ),
                },
              ]}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} bài đăng`,
              }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Quản lý người dùng" key="users">
          <div className="users-header">
            <h2 className="users-title">Quản lý người dùng</h2>
            <div className="users-actions">
              <div className="users-search">
                <SearchOutlined className="users-search-icon" />
                <Input
                  placeholder="Tìm kiếm người dùng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="users-search-input"
                />
              </div>
              <Button
                type="primary"
                className="add-user-btn"
                onClick={() => setIsAddUserModalVisible(true)}
              >
                <PlusOutlined style={{ fontSize: '14px', marginRight: '8px' }} />
                Thêm người dùng
              </Button>
            </div>
          </div>          <Card className="users-table-card">
            <Table
              dataSource={filteredUsers}
              rowKey="_id"
              loading={loading}
              columns={[
                {
                  title: 'Người dùng',
                  key: 'user',
                  render: (_, record) => (
                    <div className="dashboard-user-info">
                      <div className="dashboard-user-avatar">
                        {record.username?.charAt(0)}
                      </div>
                      <div className="dashboard-user-details">
                        <div className="dashboard-user-name">{record.username}</div>
                        <div className="dashboard-user-stats">
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
                    <span className={`dashboard-role-badge ${role === 'teacher' ? 'teacher' : 'student'}`}>
                      {role === 'teacher' ? 'Giảng viên' : 'Sinh viên'}
                    </span>
                  ),
                },
                {
                  title: 'Ngày tham gia',
                  dataIndex: 'createdAt',
                  key: 'createdAt',
                  render: (date) => new Date(date).toLocaleDateString('vi-VN'),
                },
                {
                  title: 'Trạng thái',
                  dataIndex: 'isLocked',
                  key: 'status',
                  render: (isLocked) => (
                    <span className={`dashboard-status-badge ${isLocked ? 'locked' : 'active'}`}>
                      {isLocked ? 'Bị khóa' : 'Hoạt động'}
                    </span>
                  ),
                },
                {
                  title: 'Hành động',
                  key: 'actions',
                  render: (_, record) => (
                    <Dropdown
                      overlay={
                        <Menu>                          <Menu.Item key="edit" icon={<EditOutlined />}>
                          Chỉnh sửa
                        </Menu.Item>
                          <Menu.Item
                            key="reset-password"
                            icon={<MailOutlined />}
                            onClick={() => {
                              setResetUserId(record._id);
                              setIsResetPasswordModalVisible(true);
                            }}
                          >
                            Cấp lại mật khẩu
                          </Menu.Item>
                          <Menu.Item
                            key="toggle-status"
                            icon={record.isLocked ? <UnlockOutlined /> : <LockOutlined />}
                            onClick={() => handleToggleUserStatus(record._id, record.isLocked ? 'locked' : 'active')}
                          >
                            {record.isLocked ? 'Mở khóa' : 'Khóa tài khoản'}
                          </Menu.Item>
                          <Menu.Item
                            key="delete"
                            icon={<DeleteOutlined />}
                            danger
                            onClick={() => handleDeleteUser(record._id)}
                          >
                            Xóa tài khoản
                          </Menu.Item>
                        </Menu>
                      }
                      trigger={['click']}
                    >
                      <Button type="text" size="small">
                        <MoreOutlined />
                      </Button>
                    </Dropdown>
                  ),
                },
              ]}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} người dùng`,
              }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Cài đặt" key="settings">
          <h2 className="settings-title">Cài đặt hệ thống</h2>

          <div className="settings-grid">
            <Card className="settings-card">
              <div className="settings-card-header">
                <h3 className="settings-card-title">Thông báo Email</h3>
              </div>              <div className="settings-list">
                <div className="settings-item">
                  <div className="settings-item-info">
                    <h4 className="settings-item-title">Bài đăng mới</h4>
                    <p className="settings-item-description">Gửi email khi có bài đăng mới</p>
                  </div>
                  <button
                    type="button"
                    className={`settings-toggle-btn ${settings.emailNotifications.newPosts ? 'active' : ''}`}
                    onClick={() => handleToggleEmailNotification('newPosts')}
                  >
                    {settings.emailNotifications.newPosts ? 'Bật' : 'Tắt'}
                  </button>
                </div>
                <div className="settings-item">
                  <div className="settings-item-info">
                    <h4 className="settings-item-title">Bình luận mới</h4>
                    <p className="settings-item-description">Gửi email khi có bình luận mới</p>
                  </div>
                  <button
                    type="button"
                    className={`settings-toggle-btn ${settings.emailNotifications.newComments ? 'active' : ''}`}
                    onClick={() => handleToggleEmailNotification('newComments')}
                  >
                    {settings.emailNotifications.newComments ? 'Bật' : 'Tắt'}
                  </button>
                </div>
                <div className="settings-item">
                  <div className="settings-item-info">
                    <h4 className="settings-item-title">Báo cáo vi phạm</h4>
                    <p className="settings-item-description">Gửi email khi có báo cáo vi phạm</p>
                  </div>
                  <button
                    type="button"
                    className={`settings-toggle-btn ${settings.emailNotifications.violations ? 'active' : ''}`}
                    onClick={() => handleToggleEmailNotification('violations')}
                  >
                    {settings.emailNotifications.violations ? 'Bật' : 'Tắt'}
                  </button>
                </div>
              </div>
            </Card>

            <Card className="settings-card">
              <div className="settings-card-header">
                <h3 className="settings-card-title">Cài đặt diễn đàn</h3>
              </div>              <div className="settings-form">
                <div className="settings-form-group">
                  <label className="settings-form-label">Số tags tối đa mỗi bài</label>
                  <input
                    type="number"
                    value={settings.forumSettings.maxTags}
                    onChange={(e) => handleForumSettingChange('maxTags', parseInt(e.target.value))}
                    className="settings-form-input"
                  />
                </div>
                <div className="settings-form-group">
                  <label className="settings-form-label">Số vote tối thiểu để hiển thị</label>
                  <input
                    type="number"
                    value={settings.forumSettings.minVotes}
                    onChange={(e) => handleForumSettingChange('minVotes', parseInt(e.target.value))}
                    className="settings-form-input"
                  />
                </div>
                <div className="settings-form-group">
                  <label className="settings-form-label">Tự động xóa bài sau (ngày)</label>
                  <input
                    type="number"
                    value={settings.forumSettings.autoDeleteDays}
                    onChange={(e) => handleForumSettingChange('autoDeleteDays', parseInt(e.target.value))}
                    className="settings-form-input"
                  />
                </div>
                <button
                  type="button"
                  className="settings-save-btn"
                  onClick={handleSaveForumSettings}
                >
                  Lưu cài đặt
                </button>
              </div>
            </Card>
          </div>
        </TabPane>
      </Tabs>

      {/* Add User Modal */}      <Modal
        title="Thêm người dùng mới"
        open={isAddUserModalVisible}
        onOk={handleAddUser}
        onCancel={() => {
          setIsAddUserModalVisible(false);
          setNewUser({ name: '', email: '', role: '', department: '' });
          setErrors({});
        }}
        okText="Tạo tài khoản"
        cancelText="Hủy"
        className="add-user-dialog"
        confirmLoading={loading}
      >
        <p style={{ color: '#6b7280', marginBottom: '16px' }}>
          Tạo tài khoản mới cho sinh viên hoặc giảng viên
        </p>
        <div className="add-user-form">          <div className="add-user-form-group">
          <label className="add-user-form-label">Họ và tên</label>
          <Input
            placeholder="Nguyễn Văn A"
            value={newUser.name}
            onChange={(e) => {
              setNewUser({ ...newUser, name: e.target.value });
              if (errors.name) {
                setErrors({ ...errors, name: '' });
              }
            }}
            className="add-user-form-input"
          />
          {errors.name && (
            <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
              {errors.name}
            </div>
          )}
        </div>
          <div className="add-user-form-group">
            <label className="add-user-form-label">Email</label>
            <Input
              type="email"
              placeholder="user@university.edu.vn"
              value={newUser.email}
              onChange={(e) => {
                setNewUser({ ...newUser, email: e.target.value });
                if (errors.email) {
                  setErrors({ ...errors, email: '' });
                }
              }}
              className="add-user-form-input"
            />
            {errors.email && (
              <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                {errors.email}
              </div>
            )}
          </div>
          <div className="add-user-form-group">
            <label className="add-user-form-label">Vai trò</label>
            <Select
              placeholder="Chọn vai trò"
              value={newUser.role}
              onChange={(value) => {
                setNewUser({ ...newUser, role: value });
                if (errors.role) {
                  setErrors({ ...errors, role: '' });
                }
              }}
              className="add-user-form-select"
              style={{ width: '100%' }}
            >
              <Option value="student">Sinh viên</Option>
              <Option value="teacher">Giảng viên</Option>
            </Select>
            {errors.role && (
              <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                {errors.role}
              </div>
            )}
          </div>
          <div className="add-user-form-group">
            <label className="add-user-form-label">Khoa/Bộ môn</label>
            <Select
              placeholder="Chọn khoa/bộ môn"
              value={newUser.department}
              onChange={(value) => {
                setNewUser({ ...newUser, department: value });
                if (errors.department) {
                  setErrors({ ...errors, department: '' });
                }
              }}
              className="add-user-form-select"
              style={{ width: '100%' }}
            >
              <Option value="cntt">Công nghệ thông tin</Option>
              <Option value="dien-tu">Điện tử viễn thông</Option>
              <Option value="co-khi">Cơ khí</Option>
            </Select>
            {errors.department && (
              <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                {errors.department}
              </div>
            )}
          </div></div>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        title="Đặt lại mật khẩu"
        open={isResetPasswordModalVisible}
        onOk={handleResetPassword}
        onCancel={() => {
          setIsResetPasswordModalVisible(false);
          setResetUserId(null);
          setNewPassword('');
          setErrors({});
        }}
        okText="Đặt lại mật khẩu"
        cancelText="Hủy"
        className="reset-password-dialog"
      >
        <p style={{ color: '#6b7280', marginBottom: '16px' }}>
          Nhập mật khẩu mới cho người dùng này
        </p>
        <div className="reset-password-form">
          <div className="reset-password-form-group">
            <label className="reset-password-form-label">Mật khẩu mới</label>
            <Input.Password
              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errors.password) {
                  setErrors({ ...errors, password: '' });
                }
              }}
              className="reset-password-form-input"
            />
            {errors.password && (
              <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                {errors.password}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboard;