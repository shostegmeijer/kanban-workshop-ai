import React, { useState } from 'react';
import { Bug, ChevronDown, ChevronUp } from 'lucide-react';
import { useSupabaseKanbanStore } from '../store/supabaseStore';
import { checkSupabaseConfig } from '../utils/testRealtime';

const DebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { tasks, columns, users, loading, error } = useSupabaseKanbanStore();

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-w-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-3 w-full text-left hover:bg-gray-50"
      >
        <Bug size={16} />
        <span className="font-medium">Debug Panel</span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      
      {isOpen && (
        <div className="p-4 border-t border-gray-200 max-h-96 overflow-y-auto">
          <div className="space-y-4">
            {/* Connection Status */}
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Store Status</h4>
              <div className="text-xs space-y-1">
                <div>Loading: {loading ? '✅' : '❌'}</div>
                <div>Error: {error ? '❌ ' + error : '✅ None'}</div>
              </div>
            </div>

            {/* Data Counts */}
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Data Counts</h4>
              <div className="text-xs space-y-1">
                <div>Tasks: {tasks.length}</div>
                <div>Columns: {columns.length}</div>
                <div>Users: {users.length}</div>
              </div>
            </div>

            {/* Task Details */}
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Tasks by Column</h4>
              <div className="text-xs space-y-1">
                {columns.map(column => {
                  const columnTasks = tasks.filter(t => t.columnId === column.id);
                  return (
                    <div key={column.id}>
                      {column.title}: {columnTasks.length} tasks
                      {columnTasks.length > 0 && (
                        <div className="ml-2 text-gray-500">
                          Orders: [{columnTasks.map(t => t.order).sort().join(', ')}]
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Users */}
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Users</h4>
              <div className="text-xs space-y-1">
                {users.map(user => (
                  <div key={user.id}>
                    {user.name} - {user.isOnline ? '🟢 Online' : '🔴 Offline'}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Actions</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => window.location.reload()}
                  className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Reload
                </button>
                <button
                  onClick={() => console.log('Store state:', { tasks, columns, users })}
                  className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Log State
                </button>
                <button
                  onClick={checkSupabaseConfig}
                  className="px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600"
                >
                  Test Real-time
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;