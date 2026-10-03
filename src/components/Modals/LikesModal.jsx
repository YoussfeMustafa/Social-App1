import React, { useEffect, useState } from 'react';
import { X, Heart, UserPlus, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { postsApi, usersApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../Loading/SkeletonPost';

const LikesModal = ({ isOpen, postId, onClose }) => {
  const [likes, setLikes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [followingMap, setFollowingMap] = useState({});
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (!isOpen || !postId) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const fetchLikes = async () => {
      try {
        const res = await postsApi.getPostLikes(postId, { limit: 50 });
        if (isMounted) {
          const list = res.data?.likes || res.data || [];
          setLikes(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || 'Could not load likes');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchLikes();

    return () => {
      isMounted = false;
    };
  }, [isOpen, postId]);

  const handleToggleFollow = async (userId) => {
    try {
      const res = await usersApi.toggleFollow(userId);
      const isNowFollowing = res?.data?.following ?? !followingMap[userId];
      setFollowingMap((prev) => ({ ...prev, [userId]: isNowFollowing }));
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div
        className="modal-box modal-likes animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <div className="modal-header">
          <div className="modal-title-with-icon">
            <Heart size={20} className="text-danger" fill="currentColor" />
            <h3>Liked by</h3>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-likes-list">
          {isLoading ? (
            <div className="likes-loading">
              <Spinner size={24} />
              <span>Loading likes...</span>
            </div>
          ) : error ? (
            <p className="text-error text-center p-4">{error}</p>
          ) : likes.length === 0 ? (
            <p className="text-muted text-center p-4">No likes yet on this post.</p>
          ) : (
            likes.map((likeItem) => {
              const u = likeItem.user || likeItem;
              if (!u) return null;
              const isMe = u._id === currentUser?._id;
              const isFollowing = followingMap[u._id];

              return (
                <div key={u._id || u.id} className="like-user-row">
                  <Link
                    to={`/users/${u._id || u.id}`}
                    onClick={onClose}
                    className="like-user-info"
                  >
                    <img
                      src={u.photo || 'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png'}
                      alt={u.name}
                      className="avatar avatar-md"
                    />
                    <div className="like-user-names">
                      <strong>{u.name}</strong>
                      <span className="text-muted">@{u.username}</span>
                    </div>
                  </Link>

                  {!isMe && (
                    <button
                      type="button"
                      className={`btn btn-sm ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={() => handleToggleFollow(u._id || u.id)}
                    >
                      {isFollowing ? (
                        <>
                          <Check size={14} /> Following
                        </>
                      ) : (
                        <>
                          <UserPlus size={14} /> Follow
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default LikesModal;
