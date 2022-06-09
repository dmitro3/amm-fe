import { useEffect } from 'react';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function useScrollToTop() {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);
}

export default useScrollToTop;
