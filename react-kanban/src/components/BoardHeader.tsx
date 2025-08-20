import React, { useState } from 'react';
import { Search, Filter, MoreVertical, Plus, Settings } from 'lucide-react';
import { useSupabaseKanbanStore } from '../store/supabaseStore';
import PresenceIndicator from './PresenceIndicator';
import ColumnForm from './ColumnForm';

const BoardHeader: React.FC = () => {
  const { tasks, columns, addColumn } = useSupabaseKanbanStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isColumnFormOpen, setIsColumnFormOpen] = useState(false);

  const completedTasksCount = tasks.filter(task => {
    const column = columns.find(c => c.id === task.columnId);
    return column?.title.toLowerCase() === 'done';
  }).length;
  
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  const handleAddColumn = async (title: string) => {
    await addColumn(title);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left section - Board info */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kanban Workshop Board</h1>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{totalTasks} tasks</span>
                <span>•</span>
                <span>{completedTasksCount} completed</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  {progressPercentage}% progress
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="hidden md:flex flex-col gap-1">
            <div className="text-xs text-gray-500">Project Progress</div>
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center section - Search */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
            <Filter size={18} />
          </button>
        </div>

        {/* Right section - Users and actions */}
        <div className="flex items-center gap-4">
          {/* User presence */}
          <PresenceIndicator />

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsColumnFormOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
            >
              <Plus size={16} />
              Add Column
            </button>

            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                title="Board options"
              >
                <MoreVertical size={18} />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-20 min-w-[180px]">
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <Settings size={16} />
                    Board Settings
                  </button>
                  <button 
                    onClick={() => {
                      setIsColumnFormOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 sm:hidden"
                  >
                    <Plus size={16} />
                    Add Column
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Export Board
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Share Board
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    Archive Board
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="lg:hidden mt-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Click outside to close menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
      
      {/* Column Form Modal */}
      <ColumnForm
        isOpen={isColumnFormOpen}
        onClose={() => setIsColumnFormOpen(false)}
        onSubmit={handleAddColumn}
      />
    </header>
  );
};

export default BoardHeader;