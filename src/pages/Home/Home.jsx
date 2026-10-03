import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Globe, Users, AlertCircle } from 'lucide-react';
import { postsApi } from '../../api';
import CreatePost from '../../components/CreatePost/CreatePost';
import PostCard from '../../components/PostCard/PostCard';
import { SkeletonPost, Spinner } from '../../components/Loading/SkeletonPost';
import EmptyState from '../../components/UI/EmptyState';
import SuggestionsWidget from '../../components/Sidebar/SuggestionsWidget';
import UserProfileWidget from '../../components/Sidebar/UserProfileWidget';
import { useToast } from '../../context/ToastContext';

const Home = () => {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'following'
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const { showToast } = useToast();

  const fetchPosts = useCallback(async (tab, targetPage = 1, isInitial = false) => {
    if (isInitial) setIsLoading(true);
    setError(null);

    try {
      let res;
      if (tab === 'following') {
        res = await postsApi.getFeed({ only: 'following', page: targetPage, limit: 10 });
      } else {
        res = await postsApi.getAllPosts({ page: targetPage, limit: 10 });
      }

      const newPosts = res.data?.posts || [];
      const pagination = res.meta?.pagination;

      if (targetPage === 1) {
        setPosts(newPosts);
      } else {
        setPosts((prev) => {
          // Avoid duplicate posts
          const existingIds = new Set(prev.map((p) => p._id || p.id));
          const unique = newPosts.filter((p) => !existingIds.has(p._id || p.id));
          return [...prev, ...unique];
        });
      }

      setPage(targetPage);
      if (pagination && pagination.nextPage) {
        setHasMore(true);
      } else if (newPosts.length < 10) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (err) {
      console.error('Feed error:', err);
      const msg = err?.response?.data?.message || 'Failed to load posts';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  }, [showToast]);

  // Tab switch
  useEffect(() => {
    fetchPosts(activeTab, 1, true);
  }, [activeTab, fetchPosts]);

  // Refresh feed
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPosts(activeTab, 1, false);
    showToast('Feed refreshed', 'info');
  };

  // Load more
  const handleLoadMore = () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    fetchPosts(activeTab, page + 1, false);
  };

  // Handle post created
  const handlePostCreated = (newPost) => {
    if (newPost) {
      setPosts((prev) => [newPost, ...prev]);
    }
  };

  // Handle post deleted
  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => (p._id || p.id) !== deletedId));
  };

  // Handle post updated
  const handlePostUpdated = (updatedPost) => {
    if (!updatedPost) return;
    const upId = updatedPost._id || updatedPost.id;
    setPosts((prev) =>
      prev.map((p) => ((p._id || p.id) === upId ? { ...p, ...updatedPost } : p))
    );
  };

  return (
    <div className="home-layout-container">
      {/* Left Sidebar */}
      <aside className="home-sidebar-left">
        <UserProfileWidget />
      </aside>

      {/* Main Feed Column */}
      <main className="home-feed-column">
        {/* Create Post Section */}
        <CreatePost onPostCreated={handlePostCreated} />

        {/* Feed Filter Tabs */}
        <div className="feed-header-bar card">
          <div className="feed-tabs">
            <button
              type="button"
              className={`feed-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              <Globe size={16} />
              <span>Explore</span>
            </button>
            <button
              type="button"
              className={`feed-tab-btn ${activeTab === 'following' ? 'active' : ''}`}
              onClick={() => setActiveTab('following')}
            >
              <Users size={16} />
              <span>Following</span>
            </button>
          </div>

          <button
            type="button"
            className="btn-icon btn-refresh-feed"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Refresh feed"
          >
            <RefreshCw size={17} className={isRefreshing ? 'spin-icon' : ''} />
          </button>
        </div>

        {/* Feed Posts */}
        {isLoading ? (
          <div className="feed-loading-container">
            <SkeletonPost />
            <SkeletonPost />
            <SkeletonPost />
          </div>
        ) : error ? (
          <div className="feed-error-card card animate-fade-in">
            <AlertCircle size={32} className="text-danger mb-2" />
            <h3>Unable to load posts</h3>
            <p className="text-muted">{error}</p>
            <button
              type="button"
              className="btn btn-primary mt-3"
              onClick={() => fetchPosts(activeTab, 1, true)}
            >
              Try Again
            </button>
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            icon={Users}
            title={activeTab === 'following' ? 'No posts from people you follow' : 'No posts found'}
            description={
              activeTab === 'following'
                ? 'Follow some active users from the suggestions panel or explore recent posts!'
                : 'Be the first person to share a post with the community!'
            }
            action={
              activeTab === 'following' ? (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setActiveTab('all')}
                >
                  Browse Explore Feed
                </button>
              ) : null
            }
          />
        ) : (
          <div className="posts-feed-stream">
            {posts.map((post) => (
              <PostCard
                key={post._id || post.id}
                post={post}
                onPostDeleted={handlePostDeleted}
                onPostUpdated={handlePostUpdated}
              />
            ))}

            {/* Load More Bar */}
            {hasMore ? (
              <div className="load-more-wrapper">
                <button
                  type="button"
                  className="btn btn-secondary btn-load-more"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? (
                    <>
                      <Spinner size={16} />
                      <span>Loading more posts...</span>
                    </>
                  ) : (
                    'Load More Posts'
                  )}
                </button>
              </div>
            ) : (
              <div className="feed-end-notice">
                <p>You have viewed all available posts</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Right Sidebar */}
      <aside className="home-sidebar-right">
        <SuggestionsWidget />
      </aside>
    </div>
  );
};

export default Home;
