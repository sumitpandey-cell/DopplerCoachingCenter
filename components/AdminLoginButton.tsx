'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import AdminLoginModal from './AdminLoginModal';

const AdminLoginButton = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowModal(true)}
        className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 border border-transparent hover:border-gray-200"
      >
        <Lock className="h-4 w-4 mr-2" />
        <span className="text-sm font-medium">Admin Access</span>
      </Button>
      
      <AdminLoginModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </>
  );
};

export default AdminLoginButton;