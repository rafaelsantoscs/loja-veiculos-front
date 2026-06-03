import React from 'react';
import { FiUpload, FiCheckCircle, FiXCircle } from 'react-icons/fi';

interface DocumentUploadProps {
  numero: string;
  titulo: string;
  descricao?: string;
  documento: File | null | undefined;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  required?: boolean;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  numero,
  titulo,
  descricao,
  documento,
  onUpload,
  onRemove,
  required
}) => {
  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="flex justify-between items-start mb-2">
        <label className="block text-sm font-semibold text-slate-700">
          {numero}. {titulo}
          {required && <span className="text-red-500">*</span>}
          {descricao && (
            <span className="block text-xs text-gray-500 mt-1">{descricao}</span>
          )}
        </label>
        {documento && (
          <button
            onClick={onRemove}
            className="text-red-500 hover:text-red-700"
            title="Remover documento"
          >
            <FiXCircle />
          </button>
        )}
      </div>
      
      {!documento ? (
        <div className="mt-2">
          <label className="flex items-center justify-center w-full h-24 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-blue-400 focus:outline-none">
            <span className="flex items-center space-x-2">
              <FiUpload className="text-gray-500" />
              <span className="font-medium text-gray-600">Clique para enviar</span>
            </span>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={onUpload}
            />
          </label>
        </div>
      ) : (
        <div className="mt-2 flex items-center p-2 bg-green-50 border border-green-200 rounded">
          <FiCheckCircle className="text-green-500 mr-2" />
          <span className="text-sm text-gray-700 truncate">{documento.name}</span>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;