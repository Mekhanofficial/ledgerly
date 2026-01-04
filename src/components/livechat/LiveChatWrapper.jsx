import React from 'react';
import { useLocation } from 'react-router-dom';
import LiveChat from './LiveChat';

const LiveChatWrapper = () => {
  const location = useLocation();
  
  // Don't show chat on login page or home page
  const hideChatPaths = ['/', '/login'];
  
  if (hideChatPaths.includes(location.pathname)) {
    return null;
  }
  
  return <LiveChat />;
};

export default LiveChatWrapper;