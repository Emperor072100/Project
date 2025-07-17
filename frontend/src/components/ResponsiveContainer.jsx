import React from 'react';

const ResponsiveContainer = ({ children, className = '' }) => {
  return (
    <div className={`w-full px-4 mx-auto md:w-11/12 lg:w-10/12 xl:w-3/4 ${className}`}>
      {children}
    </div>
  );
};

export default ResponsiveContainer;