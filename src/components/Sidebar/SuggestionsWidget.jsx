import React, { useEffect, useState } from 'react';
import { UserPlus, Check, Sparkles, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usersApi } from '../../api';
import { Spinner } from '../Loading/SkeletonPost';

const SuggestionsWidget = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followingMap, setFollowingMap] = useState({});

  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      const res = await usersApi.getSuggestions({ limit: 5 });
      const list = res.data?.suggestions || [];
      setSuggestions(list);
    } catch (err) {
      console.error('Failed to load suggestions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleToggleFollow = async (userId) => {
    const isCurrentlyFollowing = followingMap[userId];
    setFollowingMap((prev) => ({ ...prev, [userId]: !isCurrentlyFollowing }));

    try {
      const res = await usersApi.toggleFollow(userId);
      if (res.data && typeof res.data.following === 'boolean') {
        setFollowingMap((prev) => ({ ...prev, [userId]: res.data.following }));
      }
    } catch (err) {
      // revert
      setFollowingMap((prev) => ({ ...prev, [userId]: isCurrentlyFollowing }));
    }
  };

  return (
    <div className="widget-card card animate-fade-in">
      <div className="widget-header">
        <div className="widget-title-group">
          <Sparkles size={17} className="text-accent" />
          <h3 className="widget-title">Who to Follow</h3>
        </div>
        <button
          type="button"
          className="btn-icon btn-refresh-widget"
          onClick={fetchSuggestions}
          disabled={isLoading}
          title="Refresh suggestions"
        >
          <RefreshCw size={14} className={isLoading ? 'spin-icon' : ''} />
        </button>
      </div>

      <div className="widget-content">
        {isLoading ? (
          <div className="widget-loading">
            <Spinner size={18} />
            <span>Finding connections...</span>
          </div>
        ) : suggestions.length === 0 ? (
          <p className="text-muted text-sm py-2">No recommendations at the moment.</p>
        ) : (
          <div className="suggestions-list">
            {suggestions.map((user) => {
              const userId = user._id || user.id;
              const isFollowing = followingMap[userId];

              return (
                <div key={userId} className="suggestion-item">
                  <Link to={`/users/${userId}`} className="suggestion-user-info">
                    <img
                      src={user.photo || 'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png'}
                      alt={user.name}
                      className="avatar avatar-md"
                    />
                    <div className="suggestion-names">
                      <span className="user-display-name">{user.name}</span>
                      <span className="user-handle text-muted">@{user.username}</span>
                      {user.followersCount > 0 && (
                        <span className="user-followers-badge">
                          {user.followersCount} followers
                        </span>
                      )}
                    </div>
                  </Link>

                  <button
                    type="button"
                    className={`btn btn-sm ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={() => handleToggleFollow(userId)}
                  >
                    {isFollowing ? (
                      <>
                        <Check size={13} /> Following
                      </>
                    ) : (
                      <>
                        <UserPlus size={13} /> Follow
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuggestionsWidget;
