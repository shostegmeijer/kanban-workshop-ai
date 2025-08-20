import React, { useState, useEffect } from 'react';
import { X, Save, User, FileText, AlertTriangle } from 'lucide-react';
import { Task, TaskFormData, Priority } from '../types/kanban';
import { useKanbanStore } from '../store/kanbanStore';

interface TaskFormProps {
  columnId: string;
  task?: Task | null;
  onClose: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ columnId, task, onClose }) => {
  const { addTask, updateTask, board } = useKanbanStore();
  
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    assignee: '',
    priority: 'medium' as Priority,
  });

  const [errors, setErrors] = useState<Partial<TaskFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        assignee: task.assignee || '',
        priority: task.priority,
      });
    }
  }, [task]);

  // Get unique assignees from existing tasks
  const existingAssignees = Array.from(
    new Set(board.tasks.map(t => t.assignee).filter(Boolean))
  );

  const validateForm = (): boolean => {
    const newErrors: Partial<TaskFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (formData.assignee && formData.assignee.length > 50) {
      newErrors.assignee = 'Assignee name must be less than 50 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      if (task) {
        // Update existing task
        updateTask(task.id, {
          title: formData.title.trim(),
          description: formData.description?.trim() || undefined,
          assignee: formData.assignee?.trim() || undefined,
          priority: formData.priority,
        });
      } else {
        // Create new task
        addTask(columnId, {
          title: formData.title.trim(),
          description: formData.description?.trim() || undefined,
          assignee: formData.assignee?.trim() || undefined,
          priority: formData.priority,
        });
      }

      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
      // In a real app, show error toast/notification
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof TaskFormData,
    value: string | Priority
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return 'border-red-500 bg-red-50 text-red-700';
      case 'medium':
        return 'border-amber-500 bg-amber-50 text-amber-700';
      case 'low':
        return 'border-green-500 bg-green-50 text-green-700';
      default:
        return 'border-gray-300 bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {task ? 'Edit Task' : 'Create New Task'}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          disabled={isSubmitting}
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            <FileText size={16} className="inline mr-1" />
            Task Title *
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`
              w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'}
            `}
            placeholder="Enter task title..."
            disabled={isSubmitting}
            autoFocus
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertTriangle size={14} className="mr-1" />
              {errors.title}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className={`
              w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none
              ${errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'}
            `}
            placeholder="Enter task description..."
            disabled={isSubmitting}
          />
          <div className="flex justify-between mt-1">
            {errors.description && (
              <p className="text-sm text-red-600 flex items-center">
                <AlertTriangle size={14} className="mr-1" />
                {errors.description}
              </p>
            )}
            <p className="text-xs text-gray-500 ml-auto">
              {formData.description?.length || 0}/500
            </p>
          </div>
        </div>

        {/* Assignee */}
        <div>
          <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 mb-2">
            <User size={16} className="inline mr-1" />
            Assignee
          </label>
          <input
            id="assignee"
            type="text"
            value={formData.assignee}
            onChange={(e) => handleInputChange('assignee', e.target.value)}
            className={`
              w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${errors.assignee ? 'border-red-300 bg-red-50' : 'border-gray-300'}
            `}
            placeholder="Enter assignee name..."
            disabled={isSubmitting}
            list="assignees"
          />
          <datalist id="assignees">
            {existingAssignees.map((assignee) => (
              <option key={assignee} value={assignee} />
            ))}
          </datalist>
          {errors.assignee && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertTriangle size={14} className="mr-1" />
              {errors.assignee}
            </p>
          )}
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Priority
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['low', 'medium', 'high'] as Priority[]).map((priority) => (
              <label
                key={priority}
                className={`
                  relative flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all
                  ${formData.priority === priority 
                    ? getPriorityColor(priority) 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                  ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <input
                  type="radio"
                  name="priority"
                  value={priority}
                  checked={formData.priority === priority}
                  onChange={(e) => handleInputChange('priority', e.target.value as Priority)}
                  className="sr-only"
                  disabled={isSubmitting}
                />
                <div className="text-center">
                  <div className="text-lg mb-1">
                    {priority === 'high' ? '🔥' : priority === 'medium' ? '⚡' : '🌱'}
                  </div>
                  <div className="text-sm font-medium capitalize">
                    {priority}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            disabled={isSubmitting || !formData.title.trim()}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                {task ? 'Update Task' : 'Create Task'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;