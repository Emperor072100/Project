import React from 'react';

interface AlertDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  type?: 'success' | 'error' | 'info' | 'warning';
}

const AlertDialog: React.FC<AlertDialogProps> = ({ 
  isOpen, 
  title = "Exitoso!", 
  message, 
  onClose,
  type = 'info'
}) => {
  if (!isOpen) return null;

  // Get icon based on alert type
  const getIconByType = () => {
    if (type === 'success') {
      return (
        <div className="mx-auto flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-green-500" stroke="currentColor" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"></path>
          </svg>
        </div>
      );
    }
    return null; // No icon for other types
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
        <div className="fixed inset-0" aria-hidden="true" onClick={onClose}>
          {/* No background overlay */}
        </div>
        
        <div className="inline-block bg-white rounded-lg overflow-hidden shadow-xl transform transition-all max-w-xl w-full p-8 z-50">
          {getIconByType()}
          <h3 className="text-xl font-medium text-gray-900">{title}</h3>
          <p className="mt-3 text-base text-gray-700">{message}</p>
          
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              className="inline-flex justify-center px-10 py-3 bg-purple-600 text-white text-lg font-medium rounded-md hover:bg-purple-700"
              onClick={onClose}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AlertDialog;
