import React from "react";

interface ConfirmModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  show,
  onClose,
  onConfirm,
  title = "Tem certeza que deseja excluir este item?",
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-lg font-semibold text-center mb-4 text-black dark:text-white">
          {title}
        </h2>
        <div className="flex justify-end gap-4">
          <button
            className="px-4 py-2 rounded bg-slate-400 hover:bg-slate-700 text-white"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 rounded bg-blue-400 hover:bg-blue-700 text-white"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
