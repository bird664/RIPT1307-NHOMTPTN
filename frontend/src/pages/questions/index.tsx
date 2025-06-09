import React, { useState, useEffect } from 'react';
import { message, Input, Button, List, Spin } from 'antd';
import axios from 'axios';
import { useParams } from 'umi';

const { TextArea } = Input;

const QuestionDetailPage: React.FC = () => {
  const { id } = useParams();  // Lấy ID từ URL
  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [replyInputs, setReplyInputs] = useState<{ [key: number]: string }>({});
  const [replyVisible, setReplyVisible] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/questions/${id}`);
        setQuestion(response.data.question);
        setComments(response.data.question.comments || []);
        setLoading(false);
      } catch (error) {
        message.error('Không thể tải bài viết');
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [id]);

  const handleAddComment = async () => {
    if (!comment.trim()) {
      message.error('Vui lòng nhập bình luận');
      return;
    }

    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!storedUser._id || !storedUser.username) {
      message.error('Bạn cần đăng nhập để bình luận');
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/questions/${id}/comments`,
        {
          comment,
          userId: storedUser._id,
          username: storedUser.username,
        }
      );

      setComments(response.data.question.comments);
      setComment('');
      message.success('Bình luận đã được thêm');
    } catch (error) {
      message.error('Không thể thêm bình luận');
    }
  };

  const handleReply = async (commentIndex: number) => {
    const reply = replyInputs[commentIndex];
    if (!reply || !reply.trim()) {
      message.error('Vui lòng nhập nội dung phản hồi');
      return;
    }

    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!storedUser.username) {
      message.error('Bạn cần đăng nhập để trả lời');
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/questions/${id}/comments/${commentIndex}/replies`,
        {
          reply,
          username: storedUser.username,
        }
      );

      setComments(response.data.question.comments);
      setReplyInputs((prev) => ({ ...prev, [commentIndex]: '' }));
      setReplyVisible((prev) => ({ ...prev, [commentIndex]: false }));
      message.success('Đã trả lời bình luận');
    } catch (error) {
      message.error('Không thể trả lời bình luận');
    }
  };

  if (loading) return <Spin tip="Đang tải..." />;

  return (
    <div>
      <h2>{question.title}</h2>
      <p><strong>Người đăng:</strong> {question.username}</p>
      <p><strong>Tags:</strong> {question.tags.join(', ')}</p>
      <p>{question.content}</p>

      <h3>Bình luận</h3>
      <List
        dataSource={comments}
        renderItem={(commentItem, index) => (
          <List.Item style={{ display: 'block' }}>
            <List.Item.Meta
              title={<strong>{commentItem.username}</strong>}
              description={commentItem.comment}
            />

            {/* Hiển thị phản hồi nếu có */}
            {commentItem.replies?.length > 0 && (
              <div style={{ marginLeft: 20 }}>
                <strong>Phản hồi:</strong>
                <List
                  dataSource={commentItem.replies}
                  renderItem={(reply: { username: string; reply: string }) => (
                    <List.Item>
                      <List.Item.Meta
                        title={<small>{reply.username}</small>}
                        description={reply.reply}
                      />
                    </List.Item>
                  )}
                />
              </div>
            )}

            {/* Nút trả lời */}
            <Button
              type="link"
              onClick={() =>
                setReplyVisible((prev) => ({
                  ...prev,
                  [index]: !prev[index],
                }))
              }
            >
              {replyVisible[index] ? 'Ẩn trả lời' : 'Trả lời'}
            </Button>

            {/* Ô nhập phản hồi */}
            {replyVisible[index] && (
              <div style={{ marginTop: 10 }}>
                <TextArea
                  rows={2}
                  value={replyInputs[index] || ''}
                  onChange={(e) =>
                    setReplyInputs((prev) => ({
                      ...prev,
                      [index]: e.target.value,
                    }))
                  }
                  placeholder="Nhập phản hồi..."
                />
                <Button
                  type="primary"
                  onClick={() => handleReply(index)}
                  style={{ marginTop: 5 }}
                >
                  Gửi phản hồi
                </Button>
              </div>
            )}
          </List.Item>
        )}
      />

      <TextArea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Viết bình luận..."
        rows={4}
      />
      <Button
        type="primary"
        onClick={handleAddComment}
        style={{ marginTop: '10px' }}
      >
        Thêm bình luận
      </Button>
    </div>
  );
};

export default QuestionDetailPage;
