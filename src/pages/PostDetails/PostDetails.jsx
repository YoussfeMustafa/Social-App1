import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { postsApi } from '../../api';
import PostCard from '../../components/PostCard/PostCard';
import { SkeletonPost } from '../../components/Loading/SkeletonPost';
import SuggestionsWidget from '../../components/Sidebar/SuggestionsWidget';

const PostDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchPost = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await postsApi.getPost(id);
        if (isMounted) {
          setPost(res.data?.post || res.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || 'Failed to load post details');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchPost();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handlePostDeleted = () => {
    navigate('/', { replace: true });
  };

  const handlePostUpdated = (updated) => {
    setPost(updated);
  };

  return (
    <div className="home-layout-container post-details-layout">
      <main className="home-feed-column">
        <div className="page-header-nav card">
          <button
            type="button"
            className="btn-back"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ArrowLeft size={19} />
          </button>
          <h2 className="page-header-title">Post Details</h2>
        </div>

        {isLoading ? (
          <SkeletonPost />
        ) : error ? (
          <div className="card text-center p-6 animate-fade-in">
            <AlertCircle size={36} className="text-danger mb-2 mx-auto" />
            <h3>Post Not Found</h3>
            <p className="text-muted mt-1">{error}</p>
            <Link to="/" className="btn btn-primary mt-4 inline-flex">
              Back to Home Feed
            </Link>
          </div>
        ) : post ? (
          <PostCard
            post={post}
            showCommentsInitially={true}
            onPostDeleted={handlePostDeleted}
            onPostUpdated={handlePostUpdated}
          />
        ) : null}
      </main>

      <aside className="home-sidebar-right">
        <SuggestionsWidget />
      </aside>
    </div>
  );
};

export default PostDetails;
