import React, { useEffect, useState } from 'react';
import { Table, Button, Popconfirm, Modal, message } from 'antd';
import axios from 'axios';

const AdminPosts: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchPosts = async () => {
    const res = await axios.get('http://localhost:5000/api/questions');
    setPosts(res.data.questions);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleDelete = async (id: string) => {
    await axios.delete(`http://localhost:5000/api/questions/${id}`);
    message.success('Đã xóa bài đăng');
    fetchPosts();
  };

  const showDetail = (record: any) => {
    setSelectedPost(record);
    setModalVisible(true);
  };

  return (
    <>
      <Table
        rowKey="_id"
        dataSource={posts}
        columns={[
          { title: 'Tiêu đề', dataIndex: 'title' },
          { title: 'Tag', dataIndex: 'tags', render: (tags: string[]) => tags.join(', ') },
          {
            title: 'Hành động',
            render: (_, record) => (
              <>
                <Button onClick={() => showDetail(record)} style={{ marginRight: 8 }}>Chi tiết</Button>
                <Popconfirm title="Xóa bài này?" onConfirm={() => handleDelete(record._id)}>
                  <Button danger>Xóa</Button>
                </Popconfirm>
              </>
            ),
          },
        ]}
      />
      <Modal
        open={modalVisible}
        title="Chi tiết bài đăng"
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        {selectedPost && (
          <div>
            <h3>{selectedPost.title}</h3>
            <p><b>Nội dung:</b> {selectedPost.content}</p>
            <p><b>Tags:</b> {selectedPost.tags.join(', ')}</p>
            <p><b>Bình luận:</b></p>
            <ul>
              {selectedPost.comments?.map((c: any, idx: number) => (
                <li key={idx}>{c.username}: {c.content}</li>
              ))}
            </ul>
          </div>
        )}
      </Modal>
    </>
  );
};

export default AdminPosts;