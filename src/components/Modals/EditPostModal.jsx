import React, { useState } from 'react';
import { X, Image as ImageIcon, Trash2 } from 'lucide-react';
import { postsApi } from '../../api';
import { useToast } from '../../context/ToastContext';

const EditPostModal = ({ isOpen, post, onClose, onPostUpdated }) => {
  const [body, setBody] = useState(post?.body || '');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(post?.image || null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  if (!isOpen || !post) return null;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setRemoveExistingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveExistingImage(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!body.trim() && !imageFile && !imagePreview) {
      showToast('Post cannot be empty', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('body', body.trim());
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (removeExistingImage) {
        formData.append('image', '');
      }

      const res = await postsApi.updatePost(post._id || post.id, formData);
      showToast('Post updated successfully', 'success');
      if (onPostUpdated) {
        onPostUpdated(res.data?.post || res.data);
      }
      onClose();
    } catch (err) {
      const errMsg = err?.response?.data?.message || 'Failed to update post';
      showToast(errMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div
        className="modal-box modal-edit-post animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <div className="modal-header">
          <h3>Edit Post</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <textarea
            className="form-textarea post-edit-textarea"
            rows="4"
            placeholder="Edit your post content..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />

          {imagePreview && (
            <div className="edit-image-preview-container">
              <img src={imagePreview} alt="Preview" className="edit-image-preview" />
              <button
                type="button"
                className="btn-remove-preview"
                onClick={handleRemoveImage}
                title="Remove image"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}

          <div className="modal-edit-footer">
            <label className="btn btn-ghost btn-attach">
              <ImageIcon size={18} />
              <span>{imagePreview ? 'Change Photo' : 'Add Photo'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </label>

            <div className="modal-footer-actions">
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
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostModal;
