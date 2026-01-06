import React from 'react';
import { useLocation } from 'react-router-dom';
import LiveChat from './LiveChat';
import { InvoiceProvider } from '../../context/InvoiceContext';

const LiveChatWrapper = () => {
  const location = useLocation();
  
  // Don't show chat on login page or home page
  const hideChatPaths = ['/', '/login', '/register'];
  
  if (hideChatPaths.includes(location.pathname)) {
    return null;
  }
  
  return (
    <InvoiceProvider>
      <LiveChat />
    </InvoiceProvider>
  );
};

export default LiveChatWrapper;