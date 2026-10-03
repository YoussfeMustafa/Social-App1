import React, { useState } from 'react';
import { Heart, Trash2, MessageSquare, CornerDownRight, Send, X, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { commentsApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatRelativeTime } from '../../utils/formatDate';
import ConfirmDialog from '../UI/ConfirmDialog';

const CommentItem = ({ comment, postId, postAuthorId, onCommentDeleted }) => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const author = comment.commentCreator || comment.user || {};
  const isCommentOwner = author._id === currentUser?._id;
  const isPostOwner = postAuthorId === currentUser?._id;
  const canDelete = isCommentOwner || isPostOwner;

  // Like state
  const [likesCount, setLikesCount] = useState(comment.likesCount || comment.likes?.length || 0);
  const [isLiked, setIsLiked] = useState(() => {
    if (comment.likes && Array.isArray(comment.likes) && currentUser?._id) {
      return comment.likes.some((l) => (l._id || l) === currentUser._id);
    }
    return false;
  });

  // Replies state
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [repliesCount, setRepliesCount] = useState(comment.repliesCount || 0);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);

  // Add reply state
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Delete modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle like comment
  const handleLike = async () => {
    try {
      const prevLiked = isLiked;
      const prevCount = likesCount;
      setIsLiked(!prevLiked);
      setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);

      await commentsApi.toggleCommentLike(postId, comment._id || comment.id);
    } catch (err) {
      console.error(err);
      setIsLiked(isLiked);
      setLikesCount(likesCount);
      showToast('Could not update like', 'error');
    }
  };

  // Load replies
  const handleToggleReplies = async () => {
    if (!showReplies) {
      setShowReplies(true);
      if (replies.length === 0) {
        setIsLoadingReplies(true);
        try {
          const res = await commentsApi.getReplies(postId, comment._id || comment.id);
          const list = res.data?.replies || res.data?.comments || [];
          setReplies(list);
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoadingReplies(false);
        }
      }
    } else {
      setShowReplies(false);
    }
  };

  // Submit reply
  const handleCreateReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsSubmittingReply(true);
    try {
      const payload = { content: replyText.trim() };
      const res = await commentsApi.createReply(postId, comment._id || comment.id, payload);
      const newReply = res.data?.reply || res.data?.comment || {
        _id: Date.now().toString(),
        content: replyText.trim(),
        commentCreator: currentUser,
        createdAt: new Date().toISOString(),
      };

      setReplies((prev) => [...prev, newReply]);
      setRepliesCount((prev) => prev + 1);
      setReplyText('');
      setShowReplies(true);
      showToast('Reply added', 'success');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to submit reply';
      showToast(msg, 'error');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async () => {
    setIsDeleting(true);
    try {
      await commentsApi.deleteComment(postId, comment._id || comment.id);
      showToast('Comment deleted', 'success');
      setShowDeleteConfirm(false);
      if (onCommentDeleted) {
        onCommentDeleted(comment._id || comment.id);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to delete comment';
      showToast(msg, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="comment-item animate-fade-in">
      <Link to={`/users/${author._id || author.id}`} className="comment-avatar-link">
        <img
          src={author.photo || 'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png'}
          alt={author.name}
          className="avatar avatar-sm"
        />
      </Link>

      <div className="comment-content-wrapper">
        <div className="comment-bubble">
          <div className="comment-header">
            <Link to={`/users/${author._id || author.id}`} className="comment-author-name">
              {author.name}
            </Link>
            <span className="comment-date text-muted">
              {formatRelativeTime(comment.createdAt)}
            </span>
          </div>

          <p className="comment-text">{comment.content}</p>

          {comment.image && (
            <div className="comment-image-wrapper">
              <img src={comment.image} alt="Comment attachment" className="comment-image" />
            </div>
          )}
        </div>

        {/* Action bar for comment */}
        <div className="comment-actions">
          <button
            type="button"
            className={`comment-act-btn ${isLiked ? 'active text-danger' : ''}`}
            onClick={handleLike}
          >
            <Heart size={13} fill={isLiked ? 'currentColor' : 'none'} />
            <span>{likesCount > 0 ? likesCount : 'Like'}</span>
          </button>

          <button
            type="button"
            className="comment-act-btn"
            onClick={handleToggleReplies}
          >
            <MessageSquare size={13} />
            <span>
              {repliesCount > 0 ? `${repliesCount} ${repliesCount === 1 ? 'Reply' : 'Replies'}` : 'Reply'}
            </span>
          </button>

          {canDelete && (
            <button
              type="button"
              className="comment-act-btn btn-delete-comment"
              onClick={() => setShowDeleteConfirm(true)}
              title="Delete Comment"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>

        {/* Replies Section */}
        {showReplies && (
          <div className="replies-thread animate-fade-in">
            {isLoadingReplies ? (
              <p className="text-muted text-xs p-2">Loading replies...</p>
            ) : (
              replies.map((reply) => {
                const replyAuthor = reply.commentCreator || reply.user || {};
                return (
                  <div key={reply._id || reply.id} className="reply-item">
                    <img
                      src={replyAuthor.photo || 'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png'}
                      alt={replyAuthor.name}
                      className="avatar avatar-xs"
                    />
                    <div className="reply-bubble">
                      <div className="reply-header">
                        <strong>{replyAuthor.name}</strong>
                        <span className="text-muted text-xs">
                          {formatRelativeTime(reply.createdAt)}
                        </span>
                      </div>
                      <p className="reply-text">{reply.content}</p>
                    </div>
                  </div>
                );
              })
            )}

            {/* Quick reply input */}
            <form onSubmit={handleCreateReply} className="reply-input-form">
              <CornerDownRight size={14} className="text-muted" />
              <input
                type="text"
                className="reply-input"
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                disabled={isSubmittingReply}
              />
              <button
                type="submit"
                className="btn-send-reply"
                disabled={!replyText.trim() || isSubmittingReply}
              >
                <Send size={13} />
              </button>
            </form>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Comment?"
        message="Are you sure you want to delete this comment? This cannot be reversed."
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteComment}
        onClose={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default CommentItem;
