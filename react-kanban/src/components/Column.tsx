import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, MoreHorizontal } from 'lucide-react';
import { Column as ColumnType, Task } from '../types/kanban';
import TaskCard from './TaskCard';

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
  onAddTask?: () => void;
  onEditTask?: (task: Task) => void;
}

const Column: React.FC<ColumnProps> = ({ 
  column, 
  tasks, 
  onAddTask,
  onEditTask 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  });

  const getColumnStats = () => {
    const total = tasks.length;
    const highPriority = tasks.filter(task => task.priority === 'high').length;
    return { total, highPriority };
  };

  const stats = getColumnStats();

  return (
    <div
      ref={setNodeRef}
      className={`
        column
        ${isOver ? 'drag-over' : ''}
        flex flex-col
        relative
        h-full
      `}
      style={{
        minHeight: '100%',
        height: '100%',
        width: '320px',
        minWidth: '320px'
      }}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-gray-900 text-lg">
            {column.title}
          </h2>
          <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full font-medium">
            {stats.total}
          </span>
          {stats.highPriority > 0 && (
            <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">
              🔥 {stats.highPriority}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={onAddTask}
            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Add new task"
          >
            <Plus size={18} />
          </button>
          
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
              title="Column options"
            >
              <MoreHorizontal size={18} />
            </button>
            
            {isMenuOpen && (
              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10 min-w-[120px]">
                <button 
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setIsMenuOpen(false);
                    // Add column edit functionality here
                  }}
                >
                  Edit column
                </button>
                <button 
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  onClick={() => {
                    setIsMenuOpen(false);
                    // Add column delete functionality here
                  }}
                >
                  Delete column
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tasks Container - Full column is drop zone */}
      <div className="flex-1 flex flex-col relative" style={{ minHeight: 'calc(100% - 120px)' }}>
        <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
          <div className="flex-1 space-y-3 h-full">
            {tasks.length === 0 ? (
              /* Empty state - simple centered content, entire column is droppable */
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-gray-400 px-4 py-8">
                <div className={`flex flex-col items-center justify-center transition-all duration-200 ${
                  isOver ? 'text-blue-600 scale-105' : ''
                }`}>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-colors duration-200 ${
                    isOver ? 'bg-blue-100' : 'bg-gray-200'
                  }`}>
                    <Plus size={24} className={isOver ? 'text-blue-500' : 'text-gray-400'} />
                  </div>
                  <p className="text-lg font-medium mb-2">
                    {isOver ? 'Drop task here' : 'No tasks yet'}
                  </p>
                  {!isOver && (
                    <>
                      <p className="text-sm text-gray-500 mb-4 text-center">
                        Drag tasks here or click to add
                      </p>
                      <button
                        onClick={onAddTask}
                        className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium bg-white hover:bg-blue-50 border border-blue-200 hover:border-blue-300 rounded-md transition-colors"
                      >
                        Add your first task
                      </button>
                    </>
                  )}
                  {isOver && (
                    <div className="text-sm text-blue-600 font-medium animate-pulse mt-2">
                      Release to add task
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Tasks list */
              <>
                {tasks.map((task) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onEdit={onEditTask}
                  />
                ))}
                
                {/* Bottom drop zone for non-empty columns */}
                <div className={`min-h-[60px] rounded-lg border-2 border-dashed flex items-center justify-center transition-colors ${
                  isOver 
                    ? 'border-blue-300 bg-blue-50 text-blue-600' 
                    : 'border-gray-200 text-gray-400'
                }`}>
                  <div className="text-sm">
                    {isOver ? 'Drop task here' : 'Drop zone'}
                  </div>
                </div>
              </>
            )}
          </div>
        </SortableContext>
      </div>

      {/* Quick add button (always visible) */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <button
          onClick={onAddTask}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors border-2 border-dashed border-gray-200 hover:border-gray-300"
        >
          <Plus size={16} />
          Add task
        </button>
      </div>
    </div>
  );
};

export default Column;