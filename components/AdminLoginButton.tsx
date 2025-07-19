'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import AdminLoginModal from './AdminLoginModal';
import { motion } from 'framer-motion';

const AdminLoginButton = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        whileHover={{ 
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
          y: -2
        }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowModal(true)}
        className="text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-300 border border-transparent hover:border-blue-200 rounded-xl backdrop-blur-sm"
      >
        <motion.div
          whileHover={{ rotate: 15 }}
          transition={{ duration: 0.3 }}
        >
          <Lock className="h-4 w-4 mr-2" />
        </motion.div>
        <span className="text-sm font-medium">Admin Access</span>
      </Button>
      </motion.div>
      
      <AdminLoginModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </motion.div>
  );
};

export default AdminLoginButton;