import React, { useState } from 'react';
import { Camera, Bookmark, Users, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UploadPhotoModal from '../Modals/UploadPhotoModal';

const UserProfileWidget = () => {
  const { user } = useAuth();
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  if (!user) return null;

  return (
    <div className="user-mini-card card animate-fade-in">
      <div className="mini-card-banner">
        {user.cover ? (
          <img src={user.cover} alt="Cover" className="mini-banner-img" />
        ) : (
          <div className="mini-banner-gradient" />
        )}
      </div>

      <div className="mini-card-content">
        <div className="mini-avatar-wrapper">
          <img
            src={user.photo || 'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png'}
            alt={user.name}
            className="avatar mini-avatar"
          />
          <button
            type="button"
            className="btn-change-avatar"
            onClick={() => setShowPhotoModal(true)}
            title="Update photo"
          >
            <Camera size={13} />
          </button>
        </div>

        <div className="mini-info">
          <Link to="/profile" className="mini-name">
            {user.name}
          </Link>
          <span className="mini-handle text-muted">@{user.username}</span>
        </div>

        <div className="mini-stats-grid">
          <div className="mini-stat-item">
            <span className="mini-stat-value">{user.followingCount ?? user.following?.length ?? 0}</span>
            <span className="mini-stat-label">Following</span>
          </div>
          <div className="mini-stat-item">
            <span className="mini-stat-value">{user.followersCount ?? user.followers?.length ?? 0}</span>
            <span className="mini-stat-label">Followers</span>
          </div>
          <div className="mini-stat-item">
            <span className="mini-stat-value">{user.bookmarksCount ?? user.bookmarks?.length ?? 0}</span>
            <span className="mini-stat-label">Saved</span>
          </div>
        </div>

        <div className="mini-footer-link">
          <Link to="/profile" className="btn btn-secondary btn-block btn-sm">
            View My Profile
          </Link>
        </div>
      </div>

      <UploadPhotoModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
      />
    </div>
  );
};

export default UserProfileWidget;
