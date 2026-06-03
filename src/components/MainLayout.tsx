import React from 'react';
import HeaderNav from './HeaderNav';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex">
      <HeaderNav />
      <main className="flex-1 ml-64 p-6">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
