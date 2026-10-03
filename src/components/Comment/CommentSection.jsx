import React, { useState, useEffect, useRef } from 'react';
import { Send, Image as ImageIcon, X, MessageCircle } from 'lucide-react';
import { commentsApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import CommentItem from './CommentItem';
import { Spinner } from '../Loading/SkeletonPost';

const CommentSection = ({ postId, postAuthorId, initialCount = 0 }) => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [commentImage, setCommentImage] = useState(null);
  const [commentImagePreview, setCommentImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    let isMounted = true;
    const fetchComments = async () => {
      setIsLoading(true);
      try {
        const res = await commentsApi.getComments(postId, { page: 1, limit: 10 });
        if (isMounted) {
          const list = res.data?.comments || res.data || [];
          setComments(Array.isArray(list) ? list : []);
          const meta = res.meta?.pagination;
          if (meta && meta.nextPage) {
            setHasMore(true);
            setPage(1);
          } else {
            setHasMore(false);
          }
        }
      } catch (err) {
        console.error('Error fetching comments:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchComments();

    return () => {
      isMounted = false;
    };
  }, [postId]);

  const loadMoreComments = async () => {
    try {
      const nextPage = page + 1;
      const res = await commentsApi.getComments(postId, { page: nextPage, limit: 10 });
      const list = res.data?.comments || [];
      setComments((prev) => [...prev, ...list]);
      setPage(nextPage);
      const meta = res.meta?.pagination;
      setHasMore(Boolean(meta?.nextPage));
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCommentImage(file);
      setCommentImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setCommentImage(null);
    setCommentImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreateComment = async (e) => {
    e.preventDefault();
    const trimmed = newContent.trim();
    if (!trimmed && !commentImage) return;

    setIsSubmitting(true);
    try {
      let payload;
      if (commentImage) {
        payload = new FormData();
        payload.append('content', trimmed);
        payload.append('image', commentImage);
      } else {
        payload = { content: trimmed };
      }

      const res = await commentsApi.createComment(postId, payload);
      const created = res.data?.comment || {
        _id: Date.now().toString(),
        content: trimmed,
        image: commentImagePreview,
        commentCreator: currentUser,
        createdAt: new Date().toISOString(),
        likes: [],
        likesCount: 0,
        repliesCount: 0,
      };

      setComments((prev) => [created, ...prev]);
      setNewContent('');
      removeImage();
      showToast('Comment added!', 'success');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to post comment';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentDeleted = (commentId) => {
    setComments((prev) => prev.filter((c) => (c._id || c.id) !== commentId));
  };

  return (
    <div className="comments-container animate-fade-in">
      {/* Create Comment Bar */}
      <form onSubmit={handleCreateComment} className="comment-input-box">
        <img
          src={currentUser?.photo || 'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png'}
          alt={currentUser?.name}
          className="avatar avatar-sm"
        />
        <div className="comment-input-wrapper">
          <input
            type="text"
            className="comment-field"
            placeholder="Write a comment..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            disabled={isSubmitting}
          />

          {commentImagePreview && (
            <div className="comment-preview-pill">
              <img src={commentImagePreview} alt="attachment" />
              <button type="button" onClick={removeImage}>
                <X size={12} />
              </button>
            </div>
          )}

          <div className="comment-input-actions">
            <label className="comment-attach-btn" title="Attach image">
              <ImageIcon size={17} />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
                disabled={isSubmitting}
              />
            </label>
            <button
              type="submit"
              className="comment-submit-btn"
              disabled={isSubmitting || (!newContent.trim() && !commentImage)}
            >
              {isSubmitting ? <Spinner size={14} /> : <Send size={15} />}
            </button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="comments-list">
        {isLoading ? (
          <div className="comments-loading">
            <Spinner size={18} />
            <span>Loading comments...</span>
          </div>
        ) : comments.length === 0 ? (
          <p className="no-comments-msg">No comments yet. Be the first to join the conversation!</p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment._id || comment.id}
              comment={comment}
              postId={postId}
              postAuthorId={postAuthorId}
              onCommentDeleted={handleCommentDeleted}
            />
          ))
        )}

        {hasMore && (
          <button
            type="button"
            className="btn-load-more-comments"
            onClick={loadMoreComments}
          >
            Load previous comments
          </button>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
