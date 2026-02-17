/**
 * SplashScreen Component
 * Animated splash screen shown on app startup
 */

import React, { useState, useEffect } from 'react';
import '../styles/SplashScreen.css';

const SplashScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => {
              onComplete();
            }, 800);
          }, 300);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(progressInterval);
  }, [onComplete]);

  return (
    <div className={`splash-screen ${isExiting ? 'splash-exit' : ''}`}>
      <div className="splash-content">
        {/* Animated weather icon */}
        <div className="splash-icon-container">
          <div className="splash-sun">☀️</div>
          <div className="splash-cloud">☁️</div>
          <div className="splash-rain">🌧️</div>
        </div>

        {/* App title */}
        <h1 className="splash-title">
          <span className="splash-letter">W</span>
          <span className="splash-letter">e</span>
          <span className="splash-letter">a</span>
          <span className="splash-letter">t</span>
          <span className="splash-letter">h</span>
          <span className="splash-letter">e</span>
          <span className="splash-letter">r</span>
          <span className="splash-space"> </span>
          <span className="splash-letter">D</span>
          <span className="splash-letter">a</span>
          <span className="splash-letter">s</span>
          <span className="splash-letter">h</span>
          <span className="splash-letter">b</span>
          <span className="splash-letter">o</span>
          <span className="splash-letter">a</span>
          <span className="splash-letter">r</span>
          <span className="splash-letter">d</span>
        </h1>

        {/* Progress bar */}
        <div className="splash-progress-container">
          <div className="splash-progress-bar" style={{ width: `${progress}%` }}></div>
        </div>

        {/* Loading text */}
        <p className="splash-loading-text">
          Loading your weather experience
          <span className="splash-dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </p>
      </div>

      {/* Animated background particles */}
      <div className="splash-particles">
        {[...Array(15)].map((_, i) => (
          <div key={i} className={`splash-particle splash-particle-${i + 1}`}></div>
        ))}
      </div>
    </div>
  );
};

export default SplashScreen;
