import React, { useState, useEffect } from 'react';
import { X, Plus, Edit } from 'lucide-react';
import { Column } from '../types/kanban';

interface ColumnFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string) => void;
  column?: Column;
  mode?: 'create' | 'edit';
}

const ColumnForm: React.FC<ColumnFormProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  column, 
  mode = 'create' 
}) => {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set initial title when editing
  useEffect(() => {
    if (mode === 'edit' && column) {
      setTitle(column.title);
    } else if (mode === 'create') {
      setTitle('');
    }
  }, [mode, column, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(title.trim());
      setTitle('');
      onClose();
    } catch (error) {
      console.error('Error creating column:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setTitle('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {mode === 'edit' ? 'Edit Column' : 'Add New Column'}
            </h2>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-6">
              <label htmlFor="column-title" className="block text-sm font-medium text-gray-700 mb-2">
                Column Title
              </label>
              <input
                id="column-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter column title..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
                autoFocus
                maxLength={50}
              />
              <div className="text-xs text-gray-500 mt-1">
                {title.length}/50 characters
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {mode === 'edit' ? 'Saving...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    {mode === 'edit' ? <Edit size={16} /> : <Plus size={16} />}
                    {mode === 'edit' ? 'Save Changes' : 'Create Column'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ColumnForm;