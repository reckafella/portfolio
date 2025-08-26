import { useEffect } from 'react';

/**
 * Custom hook to set page title
 * @param title - The page specific title
 */
export const usePageTitle = (title: string) => {
  useEffect(() => {
    // Set the page title with your brand name
    document.title = `Ethan Wanyoike | ${title}`;

    // Cleanup - restore default title when component unmounts
    return () => {
      document.title = 'Ethan Wanyoike';
    };
  }, [title]);
};
