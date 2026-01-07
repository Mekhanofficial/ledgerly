// src/components/invoices/create/AttachmentsSection.jsx
import React from 'react';
import { Upload, Trash2, Image as ImageIcon, File } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

const AttachmentsSection = ({ attachments, setAttachments }) => {
  const { addToast } = useToast();

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file size (max 10MB)
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        addToast(`${file.name} exceeds 10MB limit`, 'error');
        return false;
      }
      return true;
    });
    
    if (validFiles.length > 0) {
      setAttachments([...attachments, ...validFiles]);
      addToast(`${validFiles.length} file(s) uploaded successfully`, 'success');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    
    // Validate file size (max 10MB)
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        addToast(`${file.name} exceeds 10MB limit`, 'error');
        return false;
      }
      return true;
    });
    
    if (validFiles.length > 0) {
      setAttachments([...attachments, ...validFiles]);
      addToast(`${validFiles.length} file(s) uploaded successfully`, 'success');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
    addToast('File removed', 'warning');
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="w-4 h-4" />;
    } else if (file.type === 'application/pdf') {
      return <File className="w-4 h-4 text-red-500" />;
    } else if (file.type.includes('word') || file.type.includes('document')) {
      return <File className="w-4 h-4 text-blue-500" />;
    } else {
      return <File className="w-4 h-4" />;
    }
  };

  const getFilePreview = (file) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Attachments
      </h2>
      
      <div 
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-primary-400 transition-colors cursor-pointer bg-gray-50 dark:bg-gray-900"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => document.getElementById('file-upload').click()}
      >
        <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
        <p className="text-sm mb-2 text-gray-600 dark:text-gray-300 font-medium">
          Drag & drop files or click to upload
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Supports: PDF, JPG, PNG, DOC, DOCX (Max 10MB each)
        </p>
        <input
          id="file-upload"
          type="file"
          multiple
          className="hidden"
          onChange={handleFileUpload}
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
        />
      </div>
      
      {attachments.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
            Attached Files ({attachments.length})
          </h3>
          <div className="space-y-3">
            {attachments.map((file, index) => {
              const previewUrl = getFilePreview(file);
              
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {getFileIcon(file)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {file.name}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {file.type}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {previewUrl && (
                      <a 
                        href={previewUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-1 text-primary-600 hover:text-primary-700 transition-colors"
                        title="Preview"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => removeAttachment(index)}
                      className="p-1 text-red-600 hover:text-red-700 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <span className="font-medium">Note:</span> Attached images will be included in the generated PDF invoice.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Add missing EyeIcon component
const EyeIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

export default AttachmentsSection;