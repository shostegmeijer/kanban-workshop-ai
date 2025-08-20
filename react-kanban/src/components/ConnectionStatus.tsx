import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { REALTIME_SUBSCRIBE_STATES } from '@supabase/supabase-js';

const ConnectionStatus: React.FC = () => {
  const [status, setStatus] = useState<REALTIME_SUBSCRIBE_STATES>(REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR);

  useEffect(() => {
    // Listen to channel status changes
    const channel = supabase.channel('connection-test');
    
    channel
      .subscribe((status) => {
        console.log('🔌 Connection status:', status);
        setStatus(status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getStatusDisplay = () => {
    switch (status) {
      case REALTIME_SUBSCRIBE_STATES.SUBSCRIBED:
        return {
          icon: <Wifi size={14} className="text-green-500" />,
          text: 'Connected',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700'
        };
      case REALTIME_SUBSCRIBE_STATES.CLOSED:
        return {
          icon: <WifiOff size={14} className="text-red-500" />,
          text: 'Disconnected', 
          bgColor: 'bg-red-50',
          textColor: 'text-red-700'
        };
      case REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR:
      case REALTIME_SUBSCRIBE_STATES.TIMED_OUT:
        return {
          icon: <AlertCircle size={14} className="text-red-500" />,
          text: 'Error',
          bgColor: 'bg-red-50', 
          textColor: 'text-red-700'
        };
      default:
        return {
          icon: <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />,
          text: 'Connecting...',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700'
        };
    }
  };

  const { icon, text, bgColor, textColor } = getStatusDisplay();

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {icon}
      <span>{text}</span>
    </div>
  );
};

export default ConnectionStatus;