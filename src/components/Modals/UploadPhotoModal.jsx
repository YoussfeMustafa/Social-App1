import React, { useState } from 'react';
import { X, Upload, Camera } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const UploadPhotoModal = ({ isOpen, onClose }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const { uploadPhoto, user } = useAuth();
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.type.startsWith('image/')) {
        showToast('Please select a valid image file', 'error');
        return;
      }
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      showToast('Please select a photo to upload', 'error');
      return;
    }

    setIsUploading(true);
    try {
      await uploadPhoto(file);
      showToast('Profile photo updated successfully!', 'success');
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to upload photo';
      showToast(msg, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div
        className="modal-box modal-photo animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <div className="modal-header">
          <div className="modal-title-with-icon">
            <Camera size={20} className="text-accent" />
            <h3>Update Profile Photo</h3>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleUpload} className="modal-form">
          <div className="photo-preview-center">
            <img
              src={preview || user?.photo || 'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png'}
              alt="Profile preview"
              className="photo-large-preview"
            />
          </div>

          <label className="photo-dropzone">
            <Upload size={28} className="text-accent mb-2" />
            <span>Click to browse photo from computer</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </label>

          <div className="modal-actions-end mt-4">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!file || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Save Photo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadPhotoModal;
