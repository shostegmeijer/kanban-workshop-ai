import { useEffect, useState } from 'react';
import { useSupabaseKanbanStore } from '../store/supabaseStore';
import { nanoid } from 'nanoid';

// Generate a unique session ID for this browser tab
const sessionId = nanoid();

// Create a mock current user (in a real app, this would come from auth)
const currentUser = {
  id: `user-${sessionId}`,
  name: `Workshop User ${sessionId.slice(0, 4)}`,
  avatar: `https://api.dicebear.com/7.x/avatars/svg?seed=${sessionId}`,
  isOnline: true,
  lastSeen: new Date(),
};

export const usePresence = () => {
  const { updateUserPresence, setCurrentUser } = useSupabaseKanbanStore();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Set current user and mark as online when component mounts
    setCurrentUser(currentUser);
    updateUserPresence(currentUser.id, true);

    // Handle browser visibility changes
    const handleVisibilityChange = () => {
      const online = !document.hidden;
      setIsOnline(online);
      updateUserPresence(currentUser.id, online);
    };

    // Handle page unload
    const handleBeforeUnload = () => {
      updateUserPresence(currentUser.id, false);
    };

    // Handle network status changes
    const handleOnline = () => {
      setIsOnline(true);
      updateUserPresence(currentUser.id, true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      updateUserPresence(currentUser.id, false);
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Send periodic heartbeat to maintain presence
    const heartbeatInterval = setInterval(() => {
      if (isOnline && !document.hidden) {
        updateUserPresence(currentUser.id, true);
      }
    }, 30000); // Every 30 seconds

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(heartbeatInterval);
      
      // Mark user as offline when component unmounts
      updateUserPresence(currentUser.id, false);
    };
  }, [updateUserPresence, setCurrentUser, isOnline]);

  return {
    currentUser,
    isOnline,
  };
};