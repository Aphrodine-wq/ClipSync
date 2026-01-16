/**
 * CommentThread Component
 * Comments and reactions UI
 */

import React, { useState, useEffect } from 'react';
import './CommentThread.css';

const EMOJI_OPTIONS = ['👍', '❤️', '🚀', '🎉', '💯', '🔥'];

export default function CommentThread({ clipId, socket }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadComments();
  }, [clipId]);

  const loadComments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/comments/clip/${clipId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          clipId,
          content: newComment,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments([...comments, data.comment]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Failed to create comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (commentId, emoji) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/comments/${commentId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ emoji }),
      });

      if (response.ok) {
        loadComments();
      }
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  return (
    <div className="comment-thread">
      <h3>Comments</h3>

      <div className="comments-list">
        {comments.map(comment => (
          <div key={comment.id} className="comment-item">
            <div className="comment-header">
              <img
                src={comment.user_picture || '/default-avatar.png'}
                alt={comment.user_name}
                className="comment-avatar"
              />
              <div className="comment-info">
                <span className="comment-author">{comment.user_name}</span>
                <span className="comment-time">
                  {new Date(comment.created_at).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="comment-content">{comment.content}</div>
            <div className="comment-reactions">
              {EMOJI_OPTIONS.map(emoji => (
                <button
                  key={emoji}
                  className="reaction-btn"
                  onClick={() => handleReaction(comment.id, emoji)}
                  title={`React with ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="comment-form">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="comment-input"
          rows={3}
        />
        <button type="submit" disabled={loading || !newComment.trim()} className="comment-submit">
          {loading ? 'Posting...' : 'Post Comment'}
        </button>
      </form>
    </div>
  );
}

