import React, { useEffect } from 'react';
import { useLoading } from '../../hooks/useLoading';

interface WithLoadingProps {
  isLoading?: boolean;
  children: React.ReactNode;
}

const WithLoading: React.FC<WithLoadingProps> = ({ isLoading = false, children }) => {
  const { setLoading } = useLoading();

  useEffect(() => {
    setLoading(isLoading);
    
    // Cleanup function to ensure loading is turned off
    return () => {
      setLoading(false);
    };
  }, [isLoading, setLoading]);

  return <>{children}</>;
};

// Higher-order component wrapper
export const withLoading = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return (props: P & { isLoading?: boolean }) => {
    const { isLoading, ...rest } = props;
    
    return (
      <WithLoading isLoading={isLoading}>
        <Component {...(rest as P)} />
      </WithLoading>
    );
  };
};

export default WithLoading;
