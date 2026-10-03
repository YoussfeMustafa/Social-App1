import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Camera,
  Calendar,
  Mail,
  User as UserIcon,
  UserPlus,
  Check,
  Lock,
  Grid,
  Bookmark as BookmarkIcon,
  AlertCircle,
} from 'lucide-react';
import { usersApi, authApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatFullDate } from '../../utils/formatDate';
import PostCard from '../../components/PostCard/PostCard';
import { SkeletonPost, Spinner } from '../../components/Loading/SkeletonPost';
import EmptyState from '../../components/UI/EmptyState';
import UploadPhotoModal from '../../components/Modals/UploadPhotoModal';
import ChangePasswordModal from '../../components/Modals/ChangePasswordModal';

const Profile = () => {
  const { id: paramUserId } = useParams();
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const isOwnProfile = !paramUserId || paramUserId === currentUser?._id;
  const targetUserId = isOwnProfile ? currentUser?._id : paramUserId;

  const [profileUser, setProfileUser] = useState(isOwnProfile ? currentUser : null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'bookmarks'
  const [posts, setPosts] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(!isOwnProfile);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(false);
  const [isTogglingFollow, setIsTogglingFollow] = useState(false);

  // Modals
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Fetch user profile data
  const loadProfile = useCallback(async () => {
    if (!targetUserId) return;
    setIsLoadingProfile(true);

    try {
      if (isOwnProfile) {
        const res = await authApi.getMyProfile();
        const u = res.data?.user || res.data;
        setProfileUser(u);
      } else {
        const res = await usersApi.getUserProfile(targetUserId);
        const u = res.data?.user || res.data;
        setProfileUser(u);
        if (typeof res.data?.isFollowing === 'boolean') {
          setIsFollowing(res.data.isFollowing);
        }
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      showToast('Could not load profile details', 'error');
    } finally {
      setIsLoadingProfile(false);
    }
  }, [targetUserId, isOwnProfile, showToast]);

  // Fetch user posts
  const loadPosts = useCallback(async () => {
    if (!targetUserId) return;
    setIsLoadingPosts(true);

    try {
      const res = await usersApi.getUserPosts(targetUserId, { limit: 40 });
      const list = res.data?.posts || [];
      setPosts(list);
    } catch (err) {
      console.error('Failed to load user posts:', err);
    } finally {
      setIsLoadingPosts(false);
    }
  }, [targetUserId]);

  // Fetch user bookmarks (own profile only)
  const loadBookmarks = useCallback(async () => {
    if (!isOwnProfile) return;
    setIsLoadingBookmarks(true);

    try {
      const res = await usersApi.getBookmarks({ limit: 40 });
      const list = res.data?.bookmarks || res.data?.posts || [];
      setBookmarks(list);
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
    } finally {
      setIsLoadingBookmarks(false);
    }
  }, [isOwnProfile]);

  useEffect(() => {
    loadProfile();
    loadPosts();
    if (isOwnProfile && activeTab === 'bookmarks') {
      loadBookmarks();
    }
  }, [loadProfile, loadPosts, loadBookmarks, isOwnProfile, activeTab]);

  // Handle follow / unfollow
  const handleToggleFollow = async () => {
    if (!targetUserId) return;
    setIsTogglingFollow(true);
    const prev = isFollowing;
    setIsFollowing(!prev);

    try {
      const res = await usersApi.toggleFollow(targetUserId);
      if (res.data && typeof res.data.following === 'boolean') {
        setIsFollowing(res.data.following);
        setProfileUser((u) =>
          u
            ? {
                ...u,
                followersCount: res.data.following
                  ? (u.followersCount || 0) + 1
                  : Math.max(0, (u.followersCount || 1) - 1),
              }
            : u
        );
      }
      showToast(res.data?.following ? 'User followed' : 'User unfollowed', 'info');
    } catch (err) {
      setIsFollowing(prev);
      showToast('Failed to update follow status', 'error');
    } finally {
      setIsTogglingFollow(false);
    }
  };

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => (p._id || p.id) !== deletedId));
    setBookmarks((prev) => prev.filter((p) => (p._id || p.id) !== deletedId));
  };

  const handlePostUpdated = (updated) => {
    const upId = updated._id || updated.id;
    setPosts((prev) =>
      prev.map((p) => ((p._id || p.id) === upId ? { ...p, ...updated } : p))
    );
    setBookmarks((prev) =>
      prev.map((p) => ((p._id || p.id) === upId ? { ...p, ...updated } : p))
    );
  };

  return (
    <div className="profile-page-wrapper">
      <div className="profile-container">
        {/* Profile Card Header */}
        <div className="profile-card card animate-fade-in">
          {/* Cover Banner */}
          <div className="profile-banner">
            {profileUser?.cover ? (
              <img src={profileUser.cover} alt="Cover" className="profile-banner-img" />
            ) : (
              <div className="profile-banner-gradient" />
            )}
          </div>

          {/* Profile Meta Area */}
          <div className="profile-meta-row">
            <div className="profile-avatar-outer">
              <img
                src={profileUser?.photo || 'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png'}
                alt={profileUser?.name}
                className="profile-large-avatar"
              />
              {isOwnProfile && (
                <button
                  type="button"
                  className="btn-avatar-edit-badge"
                  onClick={() => setShowPhotoModal(true)}
                  title="Update profile photo"
                >
                  <Camera size={16} />
                </button>
              )}
            </div>

            <div className="profile-actions-top">
              {isOwnProfile ? (
                <div className="profile-own-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowPhotoModal(true)}
                  >
                    <Camera size={15} /> Update Photo
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    <Lock size={15} /> Change Password
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={handleToggleFollow}
                  disabled={isTogglingFollow}
                >
                  {isFollowing ? (
                    <>
                      <Check size={16} /> Following
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} /> Follow
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* User Details */}
          <div className="profile-info-section">
            <h1 className="profile-full-name">{profileUser?.name || 'User Profile'}</h1>
            <p className="profile-username">@{profileUser?.username}</p>

            <div className="profile-bio-details">
              {profileUser?.email && (
                <div className="profile-detail-item">
                  <Mail size={15} />
                  <span>{profileUser.email}</span>
                </div>
              )}
              {profileUser?.dateOfBirth && (
                <div className="profile-detail-item">
                  <Calendar size={15} />
                  <span>Born {formatFullDate(profileUser.dateOfBirth)}</span>
                </div>
              )}
              {profileUser?.gender && (
                <div className="profile-detail-item">
                  <UserIcon size={15} />
                  <span className="capitalize">{profileUser.gender}</span>
                </div>
              )}
              {profileUser?.createdAt && (
                <div className="profile-detail-item">
                  <Calendar size={15} />
                  <span>Joined {formatFullDate(profileUser.createdAt)}</span>
                </div>
              )}
            </div>

            {/* Profile Statistics Bar */}
            <div className="profile-stats-bar">
              <div className="profile-stat-box">
                <span className="stat-number">{posts.length}</span>
                <span className="stat-label">Posts</span>
              </div>
              <div className="profile-stat-box">
                <span className="stat-number">
                  {profileUser?.followersCount ?? profileUser?.followers?.length ?? 0}
                </span>
                <span className="stat-label">Followers</span>
              </div>
              <div className="profile-stat-box">
                <span className="stat-number">
                  {profileUser?.followingCount ?? profileUser?.following?.length ?? 0}
                </span>
                <span className="stat-label">Following</span>
              </div>
              {isOwnProfile && (
                <div className="profile-stat-box">
                  <span className="stat-number">
                    {profileUser?.bookmarksCount ?? profileUser?.bookmarks?.length ?? bookmarks.length}
                  </span>
                  <span className="stat-label">Bookmarks</span>
                </div>
              )}
            </div>
          </div>

          {/* Profile Navigation Tabs */}
          <div className="profile-tabs-header">
            <button
              type="button"
              className={`profile-tab ${activeTab === 'posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              <Grid size={16} />
              <span>Posts ({posts.length})</span>
            </button>

            {isOwnProfile && (
              <button
                type="button"
                className={`profile-tab ${activeTab === 'bookmarks' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('bookmarks');
                  loadBookmarks();
                }}
              >
                <BookmarkIcon size={16} />
                <span>Saved Bookmarks</span>
              </button>
            )}
          </div>
        </div>

        {/* Profile Content Feed */}
        <div className="profile-feed-stream mt-4">
          {activeTab === 'posts' ? (
            isLoadingPosts ? (
              <div className="feed-loading-container">
                <SkeletonPost />
                <SkeletonPost />
              </div>
            ) : posts.length === 0 ? (
              <EmptyState
                icon={Grid}
                title="No posts published yet"
                description={
                  isOwnProfile
                    ? 'Share your first insight or update with the community from the home feed!'
                    : `@${profileUser?.username} has not posted anything yet.`
                }
              />
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post._id || post.id}
                  post={post}
                  onPostDeleted={handlePostDeleted}
                  onPostUpdated={handlePostUpdated}
                />
              ))
            )
          ) : (
            isLoadingBookmarks ? (
              <div className="feed-loading-container">
                <SkeletonPost />
                <SkeletonPost />
              </div>
            ) : bookmarks.length === 0 ? (
              <EmptyState
                icon={BookmarkIcon}
                title="No saved bookmarks"
                description="Click the bookmark icon on any post in your feed to save it here for quick reference."
              />
            ) : (
              bookmarks.map((post) => (
                <PostCard
                  key={post._id || post.id}
                  post={post}
                  onPostDeleted={handlePostDeleted}
                  onPostUpdated={handlePostUpdated}
                />
              ))
            )
          )}
        </div>
      </div>

      {/* Profile Modals */}
      <UploadPhotoModal
        isOpen={showPhotoModal}
        onClose={() => {
          setShowPhotoModal(false);
          loadProfile();
        }}
      />

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
};

export default Profile;
