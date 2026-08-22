'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';

interface NavbarProps {
  currentUserName?: string;
}

export const AttendanceNavbar: React.FC<NavbarProps> = () => {
  return <Navbar />;
};

export { Navbar };
