import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useSupabaseKanbanStore } from '../store/supabaseStore';
import { User } from '../types/kanban';

export const usePresence = () => {
  const { updateUserPresence, setCurrentUser } = useSupabaseKanbanStore();
  const [isOnline, setIsOnline] = useState(true);
  const { user: clerkUser, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !clerkUser) return;

    // Convert Clerk user to our User interface
    const currentUser: User = {
      id: clerkUser.id,
      name: clerkUser.fullName || clerkUser.firstName || 'Anonymous User',
      email: clerkUser.primaryEmailAddress?.emailAddress,
      imageUrl: clerkUser.imageUrl,
      isOnline: true,
      lastSeen: new Date()
    };

    // Set current user and mark as online when component mounts
    setCurrentUser(currentUser);
    updateUserPresence(currentUser.id, true);

    // Handle browser visibility changes
    const handleVisibilityChange = () => {
      if (!clerkUser) return;
      const online = !document.hidden;
      setIsOnline(online);
      updateUserPresence(clerkUser.id, online);
    };

    // Handle page unload
    const handleBeforeUnload = () => {
      if (clerkUser) {
        updateUserPresence(clerkUser.id, false);
      }
    };

    // Handle network status changes
    const handleOnline = () => {
      if (!clerkUser) return;
      setIsOnline(true);
      updateUserPresence(clerkUser.id, true);
    };

    const handleOffline = () => {
      if (!clerkUser) return;
      setIsOnline(false);
      updateUserPresence(clerkUser.id, false);
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Send periodic heartbeat to maintain presence
    const heartbeatInterval = setInterval(() => {
      if (isOnline && !document.hidden && clerkUser) {
        updateUserPresence(clerkUser.id, true);
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
      if (clerkUser) {
        updateUserPresence(clerkUser.id, false);
      }
    };
  }, [updateUserPresence, setCurrentUser, isOnline, clerkUser, isLoaded]);

  return {
    currentUser: clerkUser ? {
      id: clerkUser.id,
      name: clerkUser.fullName || clerkUser.firstName || 'Anonymous User',
      email: clerkUser.primaryEmailAddress?.emailAddress,
      imageUrl: clerkUser.imageUrl,
      isOnline: true,
      lastSeen: new Date()
    } : null,
    isOnline,
  };
};