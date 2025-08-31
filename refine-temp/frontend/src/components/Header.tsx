import React from 'react';

const Header: React.FC = () => {
  return (
    <div className="text-center mb-12 relative">
      <h1 className="text-5xl font-bold text-white mb-4 inline-block relative">
        refine
        <img
          src="/refine-nobg.png"
          alt="Refine Logo"
          className="h-16 w-16 object-contain absolute right-full mr-3 top-1/2 -translate-y-1/2"
        />
      </h1>
      <p className="text-xl text-white/90">
        is going through some maintenance.
      </p>
    </div>
  );
};

export default Header;
