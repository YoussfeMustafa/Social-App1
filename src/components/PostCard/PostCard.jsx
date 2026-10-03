import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Edit3,
  Trash2,
  Maximize2,
  X,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { postsApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatRelativeTime } from '../../utils/formatDate';
import CommentSection from '../Comment/CommentSection';
import EditPostModal from '../Modals/EditPostModal';
import SharePostModal from '../Modals/SharePostModal';
import LikesModal from '../Modals/LikesModal';
import ConfirmDialog from '../UI/ConfirmDialog';

const PostCard = ({ post, onPostDeleted, onPostUpdated, showCommentsInitially = false }) => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const author = post.user || {};
  const isPostOwner = author._id === currentUser?._id;
  const postId = post._id || post.id;

  // Like state
  const [likesCount, setLikesCount] = useState(post.likesCount || post.likes?.length || 0);
  const [isLiked, setIsLiked] = useState(() => {
    if (post.likes && Array.isArray(post.likes) && currentUser?._id) {
      return post.likes.some((l) => (l._id || l) === currentUser._id);
    }
    return false;
  });

  // Bookmark state
  const [isBookmarked, setIsBookmarked] = useState(Boolean(post.bookmarked));

  // Comments toggle
  const [showComments, setShowComments] = useState(showCommentsInitially);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);

  // Modals state
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showImageLightbox, setShowImageLightbox] = useState(false);

  // Toggle Like
  const handleToggleLike = async (e) => {
    e.stopPropagation();
    const prevLiked = isLiked;
    const prevCount = likesCount;

    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      const res = await postsApi.toggleLike(postId);
      if (res.data) {
        if (typeof res.data.liked === 'boolean') setIsLiked(res.data.liked);
        if (typeof res.data.likesCount === 'number') setLikesCount(res.data.likesCount);
      }
    } catch (err) {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      showToast('Failed to update like status', 'error');
    }
  };

  // Toggle Bookmark
  const handleToggleBookmark = async (e) => {
    e.stopPropagation();
    const prevBookmarked = isBookmarked;
    setIsBookmarked(!prevBookmarked);

    try {
      const res = await postsApi.toggleBookmark(postId);
      if (res.data && typeof res.data.bookmarked === 'boolean') {
        setIsBookmarked(res.data.bookmarked);
        showToast(res.data.bookmarked ? 'Post saved to bookmarks' : 'Post removed from bookmarks', 'info');
      }
    } catch (err) {
      setIsBookmarked(prevBookmarked);
      showToast('Failed to bookmark post', 'error');
    }
  };

  // Delete Post
  const handleDeletePost = async () => {
    setIsDeleting(true);
    try {
      await postsApi.deletePost(postId);
      showToast('Post deleted successfully', 'success');
      setShowDeleteConfirm(false);
      if (onPostDeleted) {
        onPostDeleted(postId);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to delete post';
      showToast(msg, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper to render text with clickable mentions
  const renderFormattedBody = (text) => {
    if (!text) return null;
    const parts = text.split(/(@[a-zA-Z0-9_]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const username = part.slice(1);
        return (
          <span key={index} className="mention-tag" title={`Mention: ${part}`}>
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <article className="post-card card animate-fade-in" id={`post-${postId}`}>
      {/* Header */}
      <div className="post-header">
        <Link to={`/users/${author._id || author.id}`} className="post-author-link">
          <img
            src={author.photo || 'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png'}
            alt={author.name}
            className="avatar avatar-md"
          />
          <div className="post-author-meta">
            <span className="post-author-name">{author.name}</span>
            <span className="post-author-handle">
              @{author.username} · {formatRelativeTime(post.createdAt)}
            </span>
          </div>
        </Link>

        {/* Options Menu */}
        <div className="post-options-dropdown">
          <button
            type="button"
            className="btn-icon post-menu-btn"
            onClick={() => setShowMenu(!showMenu)}
            aria-label="Post actions"
          >
            <MoreHorizontal size={18} />
          </button>

          {showMenu && (
            <div className="dropdown-menu animate-fade-in" onClick={() => setShowMenu(false)}>
              <Link to={`/posts/${postId}`} className="dropdown-item">
                View Details
              </Link>
              {isPostOwner && (
                <>
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => setShowEditModal(true)}
                  >
                    <Edit3 size={15} /> Edit Post
                  </button>
                  <button
                    type="button"
                    className="dropdown-item text-danger"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 size={15} /> Delete Post
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="post-body">
        {post.body && (
          <p className="post-text">{renderFormattedBody(post.body)}</p>
        )}

        {post.image && (
          <div className="post-image-container" onClick={() => setShowImageLightbox(true)}>
            <img src={post.image} alt="Post content" className="post-image" loading="lazy" />
            <div className="image-zoom-overlay">
              <Maximize2 size={20} />
            </div>
          </div>
        )}

        {/* Shared Post Embedded View */}
        {post.isShare && post.sharedPost && (
          <div className="shared-post-quote">
            <div className="shared-header">
              <img
                src={post.sharedPost.user?.photo || 'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png'}
                alt={post.sharedPost.user?.name}
                className="avatar avatar-xs"
              />
              <span className="shared-author">{post.sharedPost.user?.name}</span>
              <span className="text-muted text-xs">@{post.sharedPost.user?.username}</span>
            </div>
            {post.sharedPost.body && <p className="shared-text">{post.sharedPost.body}</p>}
            {post.sharedPost.image && (
              <img src={post.sharedPost.image} alt="Shared media" className="shared-image" />
            )}
          </div>
        )}
      </div>

      {/* Engagement Actions Bar */}
      <div className="post-actions-bar">
        {/* Like */}
        <div className="action-group">
          <button
            type="button"
            className={`post-act-btn like-btn ${isLiked ? 'liked' : ''}`}
            onClick={handleToggleLike}
            title={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
          </button>
          <button
            type="button"
            className="count-badge-btn"
            onClick={() => setShowLikesModal(true)}
            title="View who liked"
          >
            {likesCount}
          </button>
        </div>

        {/* Comments */}
        <button
          type="button"
          className="post-act-btn comment-btn"
          onClick={() => setShowComments(!showComments)}
          title="Comments"
        >
          <MessageCircle size={18} />
          <span className="action-count">{commentsCount}</span>
        </button>

        {/* Share */}
        <button
          type="button"
          className="post-act-btn share-btn"
          onClick={() => setShowShareModal(true)}
          title="Share post"
        >
          <Share2 size={18} />
          {post.sharesCount > 0 && <span className="action-count">{post.sharesCount}</span>}
        </button>

        {/* Bookmark */}
        <button
          type="button"
          className={`post-act-btn bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
          onClick={handleToggleBookmark}
          title={isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
        >
          <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Collapsible Comment Thread */}
      {showComments && (
        <CommentSection
          postId={postId}
          postAuthorId={author._id}
          initialCount={commentsCount}
        />
      )}

      {/* Modals */}
      <EditPostModal
        isOpen={showEditModal}
        post={post}
        onClose={() => setShowEditModal(false)}
        onPostUpdated={(updated) => {
          if (onPostUpdated) onPostUpdated(updated);
        }}
      />

      <SharePostModal
        isOpen={showShareModal}
        post={post}
        onClose={() => setShowShareModal(false)}
      />

      <LikesModal
        isOpen={showLikesModal}
        postId={postId}
        onClose={() => setShowLikesModal(false)}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be reversed."
        confirmText="Delete Post"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeletePost}
        onClose={() => setShowDeleteConfirm(false)}
      />

      {/* Full-screen Image Lightbox */}
      {showImageLightbox && (
        <div className="lightbox-backdrop animate-fade-in" onClick={() => setShowImageLightbox(false)}>
          <button className="lightbox-close" onClick={() => setShowImageLightbox(false)}>
            <X size={24} />
          </button>
          <img
            src={post.image}
            alt="Full Preview"
            className="lightbox-img animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </article>
  );
};

export default PostCard;
