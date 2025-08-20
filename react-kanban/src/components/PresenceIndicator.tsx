import React from 'react';
import { useSupabaseKanbanStore } from '../store/supabaseStore';
import { Users } from 'lucide-react';

const PresenceIndicator: React.FC = () => {
  const { users } = useSupabaseKanbanStore();
  
  const onlineUsers = users.filter(user => user.isOnline);
  const offlineUsers = users.filter(user => !user.isOnline);

  return (
    <div className="flex items-center gap-3">
      {/* Online users avatars */}
      <div className="flex items-center -space-x-2">
        {onlineUsers.slice(0, 3).map(user => (
          <div
            key={user.id}
            className="relative"
            title={`${user.name} (online)`}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 hover:scale-110 transition-transform"
              />
            ) : (
              <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-500 flex items-center justify-center text-white text-sm font-medium hover:scale-110 transition-transform">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
        ))}
        
        {/* Show count if more than 3 online users */}
        {onlineUsers.length > 3 && (
          <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-500 flex items-center justify-center text-white text-xs font-medium">
            +{onlineUsers.length - 3}
          </div>
        )}
      </div>

      {/* User count with icon */}
      <div className="flex items-center gap-1 text-gray-600">
        <Users size={16} />
        <span className="text-sm font-medium">
          {onlineUsers.length} online
        </span>
      </div>

      {/* Offline users (show on hover or in a tooltip) */}
      {offlineUsers.length > 0 && (
        <div className="hidden group-hover:block absolute top-full right-0 mt-2 p-3 bg-white rounded-lg shadow-lg border z-10 min-w-48">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Team Members</h4>
          
          <div className="space-y-2">
            {/* Online users */}
            {onlineUsers.map(user => (
              <div key={user.id} className="flex items-center gap-2 text-sm">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="flex-1">{user.name}</span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            ))}
            
            {/* Offline users */}
            {offlineUsers.map(user => (
              <div key={user.id} className="flex items-center gap-2 text-sm text-gray-500">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full grayscale" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="flex-1">{user.name}</span>
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PresenceIndicator;