import React, { createContext, useContext, useState, useEffect } from 'react';
import { checkToken } from '@/tools/auth';

const AuthContext = createContext({
  isAuth: false,
  setIsAuth: (value: boolean) => {},
  loading: true
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkToken().then(isValid => {
      setIsAuth(isValid);
      setLoading(false);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ isAuth, setIsAuth, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Хук для удобного использования в любом месте
export const useAuth = () => useContext(AuthContext);