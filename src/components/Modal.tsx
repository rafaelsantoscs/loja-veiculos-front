import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
    if (!isOpen) return null;
  
    return (
      <div className="modal-wrapper">
        <div className="overlay" onClick={onClose}></div>
        <div className="modal modal-centered">
          <div className="modal-content shadow-lg p-5">
            <div className="border-b p-2 pb-3 pt-0 mb-4">
              <div className="flex justify-between items-center">
                {title}
                <span className="close-modal cursor-pointer px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200" onClick={onClose}>
                  <i className="fas fa-times text-gray-700"></i>
                </span>
              </div>
            </div>
            {children}
          </div>
        </div>
      </div>
    );
  };
  
  export default Modal;
  