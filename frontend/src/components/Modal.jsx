import React from 'react';
import { FaTimes } from 'react-icons/fa';

const Modal = ({ isOpen, onClose, title, children, size = 'default' }) => {
  if (!isOpen) return null;

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'max-w-md';
      case 'large':
        return 'max-w-5xl';
      case 'extraLarge':
        return 'max-w-[90vw]';
      case 'fullWidth':
        return 'max-w-[95vw]';
      default:
        return 'max-w-4xl';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg shadow-xl ${getSizeClasses()} w-full mx-4 max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
