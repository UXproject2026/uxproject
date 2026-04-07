import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * A utility component that resets the window scroll position to the top
 * whenever the application's route (pathname) changes.
 * This ensures a consistent user experience when navigating between long pages.
 */
const ScrollToTop = () => {
  // Access the current location object from React Router
  const { pathname } = useLocation();

  /**
   * Effect: Scroll Resetter
   * Runs every time the 'pathname' changes.
   */
  useEffect(() => {
    // Reset window scroll to coordinates (0,0)
    window.scrollTo(0, 0);
  }, [pathname]);

  // This component handles logic only and does not render any UI elements
  return null;
};

export default ScrollToTop;
