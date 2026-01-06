// src/components/invoices/create/AttachmentsSection.jsx
import React from 'react';
import { Upload, Trash2 } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

const AttachmentsSection = ({ attachments, setAttachments }) => {
  const { addToast } = useToast();

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setAttachments([...attachments, ...files]);
    addToast('Files uploaded successfully', 'success');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setAttachments([...attachments, ...files]);
    addToast('Files uploaded successfully', 'success');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
    addToast('File removed', 'warning');
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Attachments
      </h2>
      
      <div 
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary-400 transition-colors cursor-pointer"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => document.getElementById('file-upload').click()}
      >
        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm mb-1 text-gray-600 dark:text-gray-300">
          Drag & drop files or click to upload
        </p>
        <p className="text-xs text-gray-500">
          PDF, Images, Documents (max 10MB)
        </p>
        <input
          id="file-upload"
          type="file"
          multiple
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
      
      {attachments.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Attached Files:
          </h3>
          <ul className="space-y-2">
            {attachments.map((file, index) => (
              <li key={index} className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                <span className="truncate max-w-[200px]">{file.name}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="text-red-600 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AttachmentsSection;