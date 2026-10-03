import React, { useState, useEffect } from 'react';
import { Bookmark, AlertCircle } from 'lucide-react';
import { usersApi } from '../../api';
import PostCard from '../../components/PostCard/PostCard';
import { SkeletonPost } from '../../components/Loading/SkeletonPost';
import EmptyState from '../../components/UI/EmptyState';
import SuggestionsWidget from '../../components/Sidebar/SuggestionsWidget';
import UserProfileWidget from '../../components/Sidebar/UserProfileWidget';
import { useToast } from '../../context/ToastContext';

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    let isMounted = true;
    const fetchBookmarks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await usersApi.getBookmarks({ limit: 40 });
        if (isMounted) {
          const list = res.data?.bookmarks || res.data?.posts || [];
          setBookmarks(list);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || 'Failed to load bookmarks');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchBookmarks();

    return () => {
      isMounted = false;
    };
  }, []);

  const handlePostDeleted = (deletedId) => {
    setBookmarks((prev) => prev.filter((p) => (p._id || p.id) !== deletedId));
  };

  const handlePostUpdated = (updated) => {
    const upId = updated._id || updated.id;
    setBookmarks((prev) =>
      prev.map((p) => ((p._id || p.id) === upId ? { ...p, ...updated } : p))
    );
  };

  return (
    <div className="home-layout-container">
      <aside className="home-sidebar-left">
        <UserProfileWidget />
      </aside>

      <main className="home-feed-column">
        <div className="page-header-bar card">
          <div className="page-title-group">
            <Bookmark size={20} className="text-accent" />
            <h2>Saved Bookmarks</h2>
          </div>
          <span className="text-muted text-sm">{bookmarks.length} posts saved</span>
        </div>

        {isLoading ? (
          <div className="feed-loading-container">
            <SkeletonPost />
            <SkeletonPost />
          </div>
        ) : error ? (
          <div className="card text-center p-6 animate-fade-in">
            <AlertCircle size={32} className="text-danger mb-2 mx-auto" />
            <p className="text-muted">{error}</p>
          </div>
        ) : bookmarks.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="No bookmarks saved yet"
            description="When you see interesting posts or resources in your feed, tap the bookmark icon to save them here for later."
          />
        ) : (
          <div className="posts-feed-stream">
            {bookmarks.map((post) => (
              <PostCard
                key={post._id || post.id}
                post={post}
                onPostDeleted={handlePostDeleted}
                onPostUpdated={handlePostUpdated}
              />
            ))}
          </div>
        )}
      </main>

      <aside className="home-sidebar-right">
        <SuggestionsWidget />
      </aside>
    </div>
  );
};

export default Bookmarks;
