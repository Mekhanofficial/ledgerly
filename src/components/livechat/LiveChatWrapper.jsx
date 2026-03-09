// src/components/live-chat/LiveChatWrapper.jsx
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { resolveAuthUser } from '../../utils/userDisplay';
import { getLiveChatEligibility } from '../../services/liveChatService';
import LiveChat from './LiveChat';

const LiveChatWrapper = () => {
  const location = useLocation();
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth || {});
  const authUser = resolveAuthUser(user);
  const authIdentity = authUser?._id || authUser?.id || authUser?.email || '';
  const [canAccessChat, setCanAccessChat] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  // Don't show chat on login page or home page
  const hideChat =
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/register' ||
    location.pathname.startsWith('/auth');

  useEffect(() => {
    let isActive = true;

    const checkEligibility = async () => {
      if (hideChat || !isAuthenticated || !authIdentity) {
        if (isActive) {
          setCanAccessChat(false);
          setCheckingEligibility(false);
        }
        return;
      }

      setCheckingEligibility(true);
      try {
        const eligibility = await getLiveChatEligibility();
        if (!isActive) return;
        setCanAccessChat(Boolean(eligibility?.canAccess));
      } catch {
        if (!isActive) return;
        setCanAccessChat(false);
      } finally {
        if (isActive) {
          setCheckingEligibility(false);
        }
      }
    };

    checkEligibility();

    return () => {
      isActive = false;
    };
  }, [isAuthenticated, authIdentity, hideChat]);

  if (hideChat || loading || checkingEligibility || !isAuthenticated || !authIdentity) {
    return null;
  }

  if (!canAccessChat) {
    return null;
  }

  return <LiveChat />;
};

export default LiveChatWrapper;
