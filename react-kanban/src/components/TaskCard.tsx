import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, User, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { Task, Priority } from '../types/kanban';
import { useSupabaseKanbanStore } from '../store/supabaseStore';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit }) => {
  const { deleteTask } = useSupabaseKanbanStore();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityConfig = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return {
          color: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: '🔥',
        };
      case 'medium':
        return {
          color: 'text-amber-600',
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          icon: '⚡',
        };
      case 'low':
        return {
          color: 'text-green-600',
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: '🌱',
        };
      default:
        return {
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          icon: '📋',
        };
    }
  };

  const priorityConfig = getPriorityConfig(task.priority);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(task);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(task.id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        task-card
        priority-${task.priority}
        group
        ${isDragging ? 'dragging' : ''}
      `}
    >
      {/* Header with priority indicator and actions */}
      <div className="flex items-start justify-between mb-3">
        <div className={`
          inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
          ${priorityConfig.bg} ${priorityConfig.color} ${priorityConfig.border} border
        `}>
          <span className="mr-1">{priorityConfig.icon}</span>
          {task.priority}
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleEdit}
            className="p-1 text-gray-500 hover:text-blue-600 rounded"
            title="Edit task"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 text-gray-500 hover:text-red-600 rounded"
            title="Delete task"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Task title */}
      <h3 className="font-semibold text-gray-900 mb-2 leading-tight">
        {task.title}
      </h3>

      {/* Task description */}
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Task footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
        {/* Assignee */}
        {task.assignee && (
          <div className="flex items-center gap-1">
            <User size={12} />
            <span className="truncate max-w-20">{task.assignee}</span>
          </div>
        )}

        {/* Created date */}
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          <span>{formatDate(task.createdAt)}</span>
        </div>
      </div>

      {/* Updated indicator */}
      {task.updatedAt.getTime() !== task.createdAt.getTime() && (
        <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
          <AlertCircle size={12} />
          <span>Updated {formatDate(task.updatedAt)}</span>
        </div>
      )}
    </div>
  );
};

export default TaskCard;