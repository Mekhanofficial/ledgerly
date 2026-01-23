// src/components/live-chat/LiveChatWrapper.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/UserContext';
import LiveChat from './LiveChat';

const LiveChatWrapper = () => {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  // Don't show chat on login page or home page
  const hideChat =
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/register' ||
    location.pathname.startsWith('/auth');

  if (hideChat) {
    return null;
  }

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return <LiveChat />;
};

export default LiveChatWrapper;
