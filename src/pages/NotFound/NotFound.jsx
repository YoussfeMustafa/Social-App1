import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="not-found-wrapper animate-fade-in">
      <div className="not-found-card card text-center">
        <div className="not-found-icon-box">
          <Compass size={48} className="text-accent" />
        </div>
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">Page Not Found</h2>
        <p className="not-found-text">
          The link you followed may be broken, or the page may have been removed.
        </p>
        <Link to="/" className="btn btn-primary inline-flex mt-4">
          <Home size={17} />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
