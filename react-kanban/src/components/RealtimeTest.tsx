import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const RealtimeTest: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    console.log('🧪 Setting up real-time test listener...');
    
    const channel = supabase.channel('realtime-test');
    
    channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        console.log('📋 Real-time task event received:', payload);
        setEvents(prev => [...prev.slice(-4), { 
          time: new Date().toLocaleTimeString(),
          event: payload.eventType,
          table: 'tasks',
          data: payload
        }]);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'columns' }, (payload) => {
        console.log('🏛️ Real-time column event received:', payload);
        setEvents(prev => [...prev.slice(-4), { 
          time: new Date().toLocaleTimeString(),
          event: payload.eventType,
          table: 'columns',
          data: payload
        }]);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) => {
        console.log('👥 Real-time user event received:', payload);
        setEvents(prev => [...prev.slice(-4), { 
          time: new Date().toLocaleTimeString(),
          event: payload.eventType,
          table: 'users',
          data: payload
        }]);
      })
      .subscribe((status) => {
        console.log('📡 Real-time test subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 bg-black text-white text-xs p-3 rounded-lg max-w-sm">
      <div className="font-bold mb-2">Real-time Events:</div>
      {events.length === 0 ? (
        <div className="text-gray-400">Waiting for events...</div>
      ) : (
        events.map((event, i) => (
          <div key={i} className="mb-1">
            <span className="text-green-400">{event.time}</span>{' '}
            <span className="text-blue-400">{event.table}</span>{' '}
            <span className="text-yellow-400">{event.event}</span>
          </div>
        ))
      )}
    </div>
  );
};

export default RealtimeTest;