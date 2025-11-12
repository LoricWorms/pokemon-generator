// components/Modal.tsx
import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { AppAlert, AlertType } from '../types';

interface ModalProps {
  alert: AppAlert;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ alert, onClose, title, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (alert.isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [alert.isOpen, onClose]);

  if (!alert.isOpen) return null;

  const getHeaderColorClass = (type: AlertType) => {
    switch (type) {
      case AlertType.ERROR:
        return 'bg-red-500';
      case AlertType.SUCCESS:
        return 'bg-green-500';
      case AlertType.INFO:
        return 'bg-blue-500';
      case AlertType.WARNING:
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-70 backdrop-blur-sm animate-fade-in">
      <div
        ref={modalRef}
        className="relative w-full max-w-md mx-auto bg-white rounded-lg shadow-xl overflow-hidden transform transition-all sm:my-8 sm:align-middle sm:max-w-lg animate-scale-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className={`flex items-center justify-between p-4 text-white ${getHeaderColorClass(alert.type)}`}>
          <h3 className="text-lg font-semibold" id="modal-title">
            {title || alert.type.charAt(0).toUpperCase() + alert.type.slice(1).toLowerCase()}
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-100 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-700 text-base mb-4">{alert.message}</p>
          {children}
        </div>
        <div className="px-6 py-4 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;