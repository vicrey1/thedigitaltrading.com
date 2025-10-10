import React, { useState, useEffect } from 'react';
import AdminUserList from './AdminUserList';
import AdminMirrorUser from './AdminMirrorUser';

const AdminMirror = () => {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className={`${isMobile ? 'p-2' : 'p-4'} min-h-screen w-full overflow-x-hidden`}>
      {!selectedUserId ? (
        <AdminUserList onSelectUser={setSelectedUserId} isMobile={isMobile} />
      ) : (
        <AdminMirrorUser 
          userId={selectedUserId} 
          onBack={() => setSelectedUserId(null)} 
          isMobile={isMobile}
        />
      )}
    </div>
  );
};

export default AdminMirror;
