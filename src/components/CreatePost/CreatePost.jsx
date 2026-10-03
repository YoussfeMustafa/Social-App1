import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Send, X, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { postsApi } from '../../api';

const CreatePost = ({ onPostCreated, placeholder = "What's on your mind? Mention someone with @username..." }) => {
  const [body, setBody] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const { user } = useAuth();
  const { showToast } = useToast();

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Only image files are supported', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size should be less than 5MB', 'error');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed && !imageFile) {
      showToast('Please write something or add an image', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      let postPayload;
      if (imageFile) {
        postPayload = new FormData();
        postPayload.append('body', trimmed);
        postPayload.append('image', imageFile);
      } else {
        postPayload = { body: trimmed };
      }

      const res = await postsApi.createPost(postPayload);
      const newPost = res.data?.post || res.data;

      showToast('Post published successfully!', 'success');
      setBody('');
      removeImage();

      if (onPostCreated) {
        onPostCreated(newPost);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to create post';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-post-card card animate-fade-in">
      <div className="create-post-top">
        <img
          src={user?.photo || 'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png'}
          alt={user?.name}
          className="avatar avatar-md"
        />
        <div className="create-post-input-container">
          <textarea
            className="create-post-textarea"
            rows="3"
            placeholder={placeholder}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {imagePreview && (
        <div className="create-post-preview-wrapper animate-scale-up">
          <img src={imagePreview} alt="Upload preview" className="create-post-preview-img" />
          <button
            type="button"
            className="create-post-remove-btn"
            onClick={removeImage}
            title="Remove image"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="create-post-bottom">
        <div className="create-post-tools">
          <label className="tool-btn" title="Add Image">
            <ImageIcon size={19} className="tool-icon" />
            <span className="tool-label">Photo</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              style={{ display: 'none' }}
              disabled={isSubmitting}
            />
          </label>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-publish"
          onClick={handleSubmit}
          disabled={isSubmitting || (!body.trim() && !imageFile)}
        >
          {isSubmitting ? (
            'Publishing...'
          ) : (
            <>
              <span>Post</span>
              <Send size={15} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CreatePost;
