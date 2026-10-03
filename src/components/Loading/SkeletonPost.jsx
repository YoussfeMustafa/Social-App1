import React from 'react';

export const SkeletonPost = () => {
  return (
    <div className="post-card skeleton-card">
      <div className="post-header">
        <div className="skeleton-avatar skeleton-pulse" />
        <div className="post-header-meta">
          <div className="skeleton-line line-name skeleton-pulse" />
          <div className="skeleton-line line-sub skeleton-pulse" />
        </div>
      </div>
      <div className="post-body">
        <div className="skeleton-line line-full skeleton-pulse" />
        <div className="skeleton-line line-mid skeleton-pulse" />
        <div className="skeleton-line line-short skeleton-pulse" />
      </div>
      <div className="skeleton-media skeleton-pulse" />
      <div className="post-actions-bar skeleton-actions">
        <div className="skeleton-btn skeleton-pulse" />
        <div className="skeleton-btn skeleton-pulse" />
        <div className="skeleton-btn skeleton-pulse" />
        <div className="skeleton-btn skeleton-pulse" />
      </div>
    </div>
  );
};

export const Spinner = ({ size = 20, color = 'currentColor' }) => {
  return (
    <svg
      className="inline-spinner"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
};
