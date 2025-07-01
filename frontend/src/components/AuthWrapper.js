import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

const AuthWrapper = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleView = () => {
    setIsLogin(!isLogin);
  };

  return (
    <>
      {isLogin ? (
        <Login onToggleView={toggleView} />
      ) : (
        <Register onToggleView={toggleView} />
      )}
    </>
  );
};

export default AuthWrapper;