import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Heart, MessageCircle, UserPlus, Share2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { notificationsApi } from '../../api';
import { useToast } from '../../context/ToastContext';
import { formatRelativeTime } from '../../utils/formatDate';
import EmptyState from '../../components/UI/EmptyState';
import { Spinner } from '../../components/Loading/SkeletonPost';
import SuggestionsWidget from '../../components/Sidebar/SuggestionsWidget';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const { showToast } = useToast();

  const fetchNotifications = async (isUnread = false) => {
    setIsLoading(true);
    try {
      const res = await notificationsApi.getNotifications({ unread: isUnread, limit: 30 });
      const list = res.data?.notifications || res.data || [];
      setNotifications(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
      showToast('Could not load notifications', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(unreadOnly);
  }, [unreadOnly]);

  const handleMarkOne = async (id, isRead) => {
    if (isRead) return;
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => ((n._id || n.id) === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true);
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      showToast('All notifications marked as read', 'success');
    } catch (err) {
      showToast('Failed to mark all as read', 'error');
    } finally {
      setIsMarkingAll(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart size={16} className="text-danger" fill="currentColor" />;
      case 'comment':
        return <MessageCircle size={16} className="text-accent" />;
      case 'follow':
        return <UserPlus size={16} className="text-success" />;
      case 'share':
        return <Share2 size={16} className="text-info" />;
      default:
        return <Bell size={16} className="text-accent" />;
    }
  };

  return (
    <div className="home-layout-container">
      <main className="home-feed-column">
        <div className="page-header-bar card">
          <div className="page-title-group">
            <Bell size={20} className="text-accent" />
            <h2>Notifications</h2>
          </div>

          <div className="notifications-header-actions">
            <div className="pill-filters">
              <button
                type="button"
                className={`pill-btn ${!unreadOnly ? 'active' : ''}`}
                onClick={() => setUnreadOnly(false)}
              >
                All
              </button>
              <button
                type="button"
                className={`pill-btn ${unreadOnly ? 'active' : ''}`}
                onClick={() => setUnreadOnly(true)}
              >
                Unread
              </button>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAll || notifications.length === 0}
            >
              <CheckCheck size={14} />
              <span>Mark all read</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="card text-center p-8">
            <Spinner size={24} />
            <p className="text-muted mt-2">Checking notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={unreadOnly ? 'No unread notifications' : 'No notifications yet'}
            description="When someone likes your posts, comments, or follows your profile, you'll receive updates here."
          />
        ) : (
          <div className="notifications-stream">
            {notifications.map((notif) => {
              const actor = notif.actor || notif.sender || notif.user || {};
              const notifId = notif._id || notif.id;

              return (
                <div
                  key={notifId}
                  className={`notification-card card ${!notif.read ? 'unread' : ''}`}
                  onClick={() => handleMarkOne(notifId, notif.read)}
                >
                  <div className="notif-type-badge">
                    {getNotificationIcon(notif.type)}
                  </div>

                  <Link to={`/users/${actor._id || actor.id}`}>
                    <img
                      src={actor.photo || 'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png'}
                      alt={actor.name}
                      className="avatar avatar-md"
                    />
                  </Link>

                  <div className="notif-content-area">
                    <p className="notif-message-text">
                      <Link to={`/users/${actor._id || actor.id}`} className="notif-actor-name">
                        {actor.name || 'Someone'}
                      </Link>{' '}
                      {notif.message || notif.content || 'interacted with your profile'}
                    </p>
                    <span className="notif-time text-muted text-xs">
                      {formatRelativeTime(notif.createdAt)}
                    </span>
                  </div>

                  {!notif.read && <span className="unread-dot" />}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <aside className="home-sidebar-right">
        <SuggestionsWidget />
      </aside>
    </div>
  );
};

export default Notifications;
