// src/components/admin/UserDetail.js
import React, { useState } from 'react';
import { FiX, FiCheck, FiAlertTriangle, FiDownload, FiUser, FiMail, FiCalendar, FiShield, FiFileText, FiEye, FiLock, FiActivity, FiEdit } from 'react-icons/fi';
import { approveKYC, rejectKYC, updateUserTier, updateUserRole, getUserKeys } from '../../services/adminAPI';

const fetchKYCImage = async (filename, token) => {
  const response = await fetch(`/uploads/kyc/${filename}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch image');
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

const UserDetail = ({ user, onClose, onUpdate, isMobile = false }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [rejectionReason, setRejectionReason] = useState('');
  const [userTier, setUserTier] = useState(user.tier);
  const [userRole, setUserRole] = useState(user.role);
  const [kycStatus, setKycStatus] = useState(user.kyc?.status || user.kycStatus);
  const [loading, setLoading] = useState(false);
  const [imageModal, setImageModal] = useState({ open: false, url: '', label: '' });
  const [keys, setKeys] = useState({ wallets: {}, loaded: false, error: '' });

  const handleApproveKYC = async () => {
    setLoading(true);
    try {
      const updated = await approveKYC(user.id || user._id);
      setKycStatus('verified');
      onUpdate(updated);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectKYC = async () => {
    setLoading(true);
    try {
      const updated = await rejectKYC(user.id || user._id, rejectionReason);
      setKycStatus('rejected');
      onUpdate(updated);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    setLoading(true);
    try {
      const userId = user.id || user._id;
      if (!userId) {
        console.warn('User ID is undefined in handleUpdateUser:', user);
        return;
      }
      
      // Update tier if changed
      if (userTier !== user.tier) {
        const updated = await updateUserTier(userId, userTier);
        onUpdate(updated);
      }
      
      // Update role if changed
      if (userRole !== user.role) {
        const updated = await updateUserRole(userId, userRole);
        onUpdate(updated);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTierChange = async (e) => {
    const newTier = e.target.value;
    setUserTier(newTier);
    const userId = user.id || user._id;
    if (!userId) {
      console.warn('User ID is undefined in handleTierChange:', user);
      return;
    }
    const updated = await updateUserTier(userId, newTier);
    onUpdate(updated);
  };

  const handleRoleChange = async (e) => {
    const newRole = e.target.value;
    setUserRole(newRole);
    const userId = user.id || user._id;
    if (!userId) {
      console.warn('User ID is undefined in handleRoleChange:', user);
      return;
    }
    const updated = await updateUserRole(userId, newRole);
    onUpdate(updated);
  };

  const handleViewKYCImage = async (filename, label) => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const url = await fetchKYCImage(filename, token);
      setImageModal({ open: true, url, label });
    } catch {
      alert('Failed to load image.');
    }
  };

  const handleFetchKeys = async () => {
    setKeys({ wallets: {}, loaded: false, error: '' });
    try {
      const data = await getUserKeys(user.id || user._id);
      setKeys({ wallets: data.wallets, loaded: true, error: '' });
    } catch (err) {
      setKeys({ wallets: {}, loaded: false, error: err.toString() });
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'documents', label: 'Documents' },
    { id: 'activity', label: 'Activity' },
    { id: 'notes', label: 'Notes' }
  ];

  return (
    <>
      {/* Modal Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
        {/* Modal Container */}
        <div className={`bg-gray-900 rounded-xl shadow-2xl border border-gray-700 relative ${
          isMobile 
            ? 'w-full h-full max-w-none max-h-none rounded-none' 
            : 'w-full max-w-4xl max-h-[90vh] rounded-xl'
        } overflow-hidden`}>
          
          {/* Modal Header */}
          <div className="bg-gray-800 border-b border-gray-700 p-4 sm:p-6 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center flex-1 min-w-0">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-gold to-yellow-600 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 shadow-lg">
                <span className="text-lg sm:text-2xl font-bold text-black">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-white truncate mb-1">
                  {user.name || 'Unknown User'}
                </h2>
                <p className="text-sm sm:text-base text-gray-300 truncate">
                  {user.email}
                </p>
                <p className="text-xs text-gray-500 font-mono">
                  ID: {user.id}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 sm:p-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0 ml-2"
            >
              <FiX size={isMobile ? 20 : 24} />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="bg-gray-800 border-b border-gray-700 px-4 sm:px-6">
            <div className={`flex ${isMobile ? 'overflow-x-auto scrollbar-hide' : 'flex-wrap'} gap-1`}>
              {['overview', 'documents', 'activity', 'notes'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-gray-900 text-gold border-b-2 border-gold'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Modal Content */}
          <div className={`${isMobile ? 'h-full overflow-y-auto' : 'max-h-[calc(90vh-200px)] overflow-y-auto'} p-4 sm:p-6`}>
            
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Account Details */}
                <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
                  <h3 className="text-lg sm:text-xl font-bold mb-4 text-white flex items-center">
                    <FiUser className="mr-2 text-gold" size={20} />
                    Account Details
                  </h3>
                  <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-2 gap-6'}`}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">User ID</label>
                        <div className="bg-gray-700 p-3 rounded-lg font-mono text-sm text-white border border-gray-600">
                          {user.id}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Current Tier</label>
                        <select 
                          value={userTier} 
                          onChange={e => setUserTier(e.target.value)}
                          className="w-full bg-gray-700 text-white rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold border border-gray-600 hover:border-gray-500 transition-colors"
                        >
                          <option value="Basic">Basic</option>
                          <option value="Gold">Gold</option>
                          <option value="VIP">VIP</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Role</label>
                        <select 
                          value={userRole} 
                          onChange={e => setUserRole(e.target.value)}
                          className="w-full bg-gray-700 text-white rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold border border-gray-600 hover:border-gray-500 transition-colors"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">KYC Status</label>
                        <div className={`p-3 rounded-lg border text-sm font-medium ${
                          kycStatus === 'verified' 
                            ? 'bg-green-500 bg-opacity-20 text-green-300 border-green-500' 
                            : kycStatus === 'pending' 
                            ? 'bg-yellow-500 bg-opacity-20 text-yellow-300 border-yellow-500' 
                            : 'bg-red-500 bg-opacity-20 text-red-300 border-red-500'
                        }`}>
                          {kycStatus?.charAt(0)?.toUpperCase() + kycStatus?.slice(1) || 'Not Started'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Join Date</label>
                        <div className="bg-gray-700 p-3 rounded-lg text-sm text-white border border-gray-600">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Last Active</label>
                        <div className="bg-gray-700 p-3 rounded-lg text-sm text-white border border-gray-600">
                          {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'gap-4'} mt-6`}>
                    <button 
                      onClick={handleUpdateUser} 
                      className="flex-1 bg-gold hover:bg-yellow-500 text-black px-6 py-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Update User'}
                    </button>
                    <button 
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors border border-gray-600 hover:border-gray-500"
                    >
                      Reset Password
                    </button>
                  </div>
                </div>

                {/* KYC Management */}
                {kycStatus === 'pending' && (
                  <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
                    <h3 className="text-lg sm:text-xl font-bold mb-4 text-white flex items-center">
                      <FiShield className="mr-2 text-yellow-400" size={20} />
                      KYC Review
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Rejection Reason (Optional)</label>
                        <textarea 
                          rows={3}
                          placeholder="Enter reason if rejecting KYC..." 
                          value={rejectionReason} 
                          onChange={e => setRejectionReason(e.target.value)} 
                          className="w-full bg-gray-700 text-white rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold border border-gray-600 hover:border-gray-500 transition-colors resize-none"
                        />
                      </div>
                      <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'gap-4'}`}>
                        <button 
                          onClick={handleApproveKYC} 
                          className="flex-1 bg-green-600 hover:bg-green-500 px-6 py-3 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center" 
                          disabled={loading}
                        >
                          <FiCheck className="w-4 h-4 mr-2" />
                          Approve KYC
                        </button>
                        <button 
                          onClick={handleRejectKYC} 
                          className="flex-1 bg-red-600 hover:bg-red-500 px-6 py-3 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center" 
                          disabled={loading}
                        >
                          <FiX className="w-4 h-4 mr-2" />
                          Reject KYC
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* KYC Verification Details */}
                <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
                  <h3 className="text-lg sm:text-xl font-bold mb-4 text-white flex items-center">
                    <FiFileText className="mr-2 text-blue-400" size={20} />
                    KYC Verification
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Country</label>
                      <div className="bg-gray-700 p-3 rounded-lg text-sm text-white border border-gray-600">
                        {user.kyc?.country || 'Not provided'}
                      </div>
                    </div>
                    <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-2 gap-6'}`}>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">ID Document</label>
                        {user.kyc?.idUrl ? (
                          <button
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                            onClick={() => handleViewKYCImage(user.kyc.idUrl.split('/').pop(), 'ID Document')}
                          >
                            <FiEye className="mr-2 w-4 h-4" /> 
                            View Document
                          </button>
                        ) : (
                          <div className="bg-gray-700 p-3 rounded-lg text-sm text-gray-400 border border-gray-600 text-center">
                            Not uploaded
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Selfie</label>
                        {user.kyc?.selfieUrl ? (
                          <button
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                            onClick={() => handleViewKYCImage(user.kyc.selfieUrl.split('/').pop(), 'Selfie')}
                          >
                            <FiEye className="mr-2 w-4 h-4" /> 
                            View Selfie
                          </button>
                        ) : (
                          <div className="bg-gray-700 p-3 rounded-lg text-sm text-gray-400 border border-gray-600 text-center">
                            Not uploaded
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`flex items-center p-3 rounded-lg border text-sm font-medium ${
                      kycStatus === 'verified' 
                        ? 'bg-green-500 bg-opacity-20 text-green-300 border-green-500' 
                        : kycStatus === 'rejected' 
                        ? 'bg-red-500 bg-opacity-20 text-red-300 border-red-500' 
                        : 'bg-yellow-500 bg-opacity-20 text-yellow-300 border-yellow-500'
                    }`}>
                      {kycStatus === 'verified' ? (
                        <FiCheck className="mr-2 w-4 h-4" />
                      ) : kycStatus === 'rejected' ? (
                        <FiX className="mr-2 w-4 h-4" />
                      ) : (
                        <FiAlertTriangle className="mr-2 w-4 h-4" />
                      )}
                      <span>KYC Status: {kycStatus?.charAt(0)?.toUpperCase() + kycStatus?.slice(1) || 'Not Started'}</span>
                    </div>
                    {kycStatus === 'rejected' && user.kyc?.rejectionReason && (
                      <div className="bg-red-500 bg-opacity-20 border border-red-500 p-3 rounded-lg">
                        <p className="text-red-300 text-sm font-medium mb-1">Rejection Reason:</p>
                        <p className="text-red-200 text-sm">{user.kyc.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sensitive Keys */}
                <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
                  <h3 className="text-lg sm:text-xl font-bold mb-4 text-white flex items-center">
                    <FiLock className="mr-2 text-red-400" size={20} />
                    Sensitive Keys
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-red-500 bg-opacity-20 border border-red-500 p-3 rounded-lg">
                      <p className="text-red-300 text-sm font-medium mb-1">⚠️ Security Warning</p>
                      <p className="text-red-200 text-xs">These keys provide full access to user wallets. Handle with extreme care.</p>
                    </div>
                    <button
                      className="w-full bg-gold hover:bg-yellow-500 text-black px-6 py-3 rounded-lg text-sm font-medium transition-colors"
                      onClick={handleFetchKeys}
                      type="button"
                    >
                      Reveal All Wallet Keys
                    </button>
                    {keys.loaded && (
                      <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                        <div className="space-y-4">
                          {Object.entries(keys.wallets).map(([network, data]) => (
                            <div key={network} className="border-b border-gray-700 pb-4 last:border-b-0 last:pb-0">
                              <div className="font-bold text-gold mb-3 text-sm uppercase tracking-wide">{network}</div>
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-xs text-gray-400 mb-1">Address</label>
                                  <div className="bg-gray-800 p-2 rounded text-xs text-white font-mono break-all border border-gray-600">
                                    {data.address}
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-400 mb-1">Mnemonic</label>
                                  <div className="bg-gray-800 p-2 rounded text-xs text-white font-mono break-all border border-gray-600">
                                    {data.mnemonic}
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-400 mb-1">Private Key</label>
                                  <div className="bg-gray-800 p-2 rounded text-xs text-white font-mono break-all border border-gray-600">
                                    {data.privateKey}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {keys.error && (
                      <div className="bg-red-500 bg-opacity-20 border border-red-500 p-3 rounded-lg">
                        <p className="text-red-300 text-sm">{keys.error}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
                  <h3 className="text-lg sm:text-xl font-bold mb-4 text-white flex items-center">
                    <FiFileText className="mr-2 text-blue-400" size={20} />
                    KYC Documents
                  </h3>
                  <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-1 md:grid-cols-2 gap-6'}`}>
                    {user.kyc?.idUrl && (
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-400">ID Document</label>
                        <div className="relative group">
                          <img 
                            src={user.kyc.idUrl} 
                            alt="ID Document" 
                            className="rounded-lg w-full object-cover max-h-64 border border-gray-600 cursor-pointer hover:border-gold transition-colors" 
                            onClick={() => handleViewKYCImage(user.kyc.idUrl.split('/').pop(), 'ID Document')}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition-all duration-200 flex items-center justify-center">
                            <FiEye className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                          </div>
                        </div>
                      </div>
                    )}
                    {user.kyc?.selfieUrl && (
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-400">Selfie</label>
                        <div className="relative group">
                          <img 
                            src={user.kyc.selfieUrl} 
                            alt="Selfie" 
                            className="rounded-lg w-full object-cover max-h-64 border border-gray-600 cursor-pointer hover:border-gold transition-colors" 
                            onClick={() => handleViewKYCImage(user.kyc.selfieUrl.split('/').pop(), 'Selfie')}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition-all duration-200 flex items-center justify-center">
                            <FiEye className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                          </div>
                        </div>
                      </div>
                    )}
                    {!(user.kyc?.idUrl || user.kyc?.selfieUrl) && (
                      <div className="col-span-full text-center py-12">
                        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FiFileText size={24} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-300 mb-2">No Documents</h3>
                        <p className="text-gray-400">No KYC documents have been uploaded yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
                  <h3 className="text-lg sm:text-xl font-bold mb-4 text-white flex items-center">
                    <FiActivity className="mr-2 text-green-400" size={20} />
                    User Activity
                  </h3>
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiActivity size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-300 mb-2">Activity Log</h3>
                    <p className="text-gray-400">Activity tracking feature coming soon...</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
                  <h3 className="text-lg sm:text-xl font-bold mb-4 text-white flex items-center">
                    <FiEdit className="mr-2 text-purple-400" size={20} />
                    Admin Notes
                  </h3>
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiEdit size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-300 mb-2">Notes Feature</h3>
                    <p className="text-gray-400">Admin notes feature coming soon...</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Image Modal */}
      {imageModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[60] p-4">
          <div className={`bg-gray-900 rounded-xl shadow-2xl border border-gray-700 relative ${
            isMobile ? 'w-full max-w-sm' : 'max-w-2xl w-full'
          }`}>
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-gold">{imageModal.label}</h3>
                <button 
                  onClick={() => setImageModal({ open: false, url: '', label: '' })} 
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>
              <div className="relative">
                <img 
                  src={imageModal.url} 
                  alt={imageModal.label} 
                  className="max-w-full max-h-[70vh] rounded-lg border border-gray-600 mx-auto block" 
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserDetail;