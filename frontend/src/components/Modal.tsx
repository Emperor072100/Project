import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay con fondo difuminado */}
      <div 
        className="fixed inset-0 backdrop-blur-sm bg-black/30 transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      ></div>
      
      {/* Contenido del modal */}
      <div className="bg-white rounded-lg shadow-xl z-10 max-w-4xl w-full max-h-[90vh] overflow-hidden relative animate-fadeIn">
        {title && (
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-medium text-gray-800">{title}</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-medium"
              aria-label="Cerrar"
            >
              &times;
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;