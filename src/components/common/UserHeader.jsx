import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export default function UserHeader({ className = '' }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await base44.auth.me();
      setUserName(user?.full_name || user?.email || 'Agent');
    };
    fetchUser();
  }, []);

  return (
    <div className={`text-right text-sm text-gray-600 dark:text-gray-300 ${className}`}>
      <div className="font-medium">{userName}</div>
      <div>{currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      <div>{currentTime.toLocaleTimeString()}</div>
    </div>
  );
}