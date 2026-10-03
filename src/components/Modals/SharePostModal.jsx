import React, { useState } from 'react';
import { X, Share2 } from 'lucide-react';
import { postsApi } from '../../api';
import { useToast } from '../../context/ToastContext';

const SharePostModal = ({ isOpen, post, onClose, onPostShared }) => {
  const [commentary, setCommentary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  if (!isOpen || !post) return null;

  const handleShare = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await postsApi.sharePost(post._id || post.id, {
        body: commentary.trim() || undefined,
      });
      showToast('Post shared to your feed!', 'success');
      if (onPostShared) {
        onPostShared(res.data?.post || res.data);
      }
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to share post';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div
        className="modal-box modal-share animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <div className="modal-header">
          <div className="modal-title-with-icon">
            <Share2 size={20} className="text-accent" />
            <h3>Share Post</h3>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleShare} className="modal-form">
          <textarea
            className="form-textarea post-share-textarea"
            rows="3"
            placeholder="Add your thoughts or commentary (optional)..."
            value={commentary}
            onChange={(e) => setCommentary(e.target.value)}
          />

          {/* Original Post Embed Card */}
          <div className="shared-embed-preview">
            <div className="shared-embed-header">
              <img
                src={post.user?.photo || 'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png'}
                alt={post.user?.name}
                className="avatar avatar-sm"
              />
              <div>
                <strong>{post.user?.name}</strong>
                <span className="text-muted"> @{post.user?.username}</span>
              </div>
            </div>
            {post.body && <p className="shared-embed-body">{post.body}</p>}
            {post.image && (
              <img src={post.image} alt="Attached" className="shared-embed-image" />
            )}
          </div>

          <div className="modal-actions-end">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sharing...' : 'Share Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SharePostModal;
