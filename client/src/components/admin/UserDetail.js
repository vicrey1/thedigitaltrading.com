// src/components/admin/UserDetail.js
import React, { useState } from 'react';
import { FiX, FiCheck, FiAlertTriangle, FiDownload, FiUser, FiMail, FiCalendar, FiShield } from 'react-icons/fi';
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
  const [tier, setTier] = useState(user.tier);
  const [role, setRole] = useState(user.role);
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

  const handleTierChange = async (e) => {
    const newTier = e.target.value;
    setTier(newTier);
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
    setRole(newRole);
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
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-2 sm:p-4">
        <div className={`bg-gray-800 rounded-xl w-full ${isMobile ? 'max-w-full h-full' : 'max-w-4xl max-h-[90vh]'} overflow-y-auto scrollbar-thin scrollbar-thumb-gold scrollbar-track-gray-900/60`}>
          <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
            {/* Header */}
            <div className="flex justify-between items-start mb-4 sm:mb-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <FiUser className="w-5 h-5 text-gold flex-shrink-0" />
                  <h2 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold truncate`}>{user.name}</h2>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <FiMail className="w-4 h-4 flex-shrink-0" />
                  <p className="text-sm truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-700 flex-shrink-0 ml-2"
              >
                <FiX size={isMobile ? 20 : 24} />
              </button>
            </div>

            {/* Tabs */}
            <div className={`flex border-b border-gray-700 mb-4 sm:mb-6 ${isMobile ? 'overflow-x-auto' : ''}`}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 sm:px-4 py-2 text-sm sm:text-base whitespace-nowrap ${
                    activeTab === tab.id ? 'border-b-2 border-gold text-gold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'md:grid-cols-2 gap-6'}`}>
                <div className="space-y-4">
                  {/* Account Details */}
                  <div>
                    <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-bold mb-3 flex items-center`}>
                      <FiShield className="w-4 h-4 mr-2 text-gold" />
                      Account Details
                    </h3>
                    <div className="bg-gray-700 p-3 sm:p-4 rounded-lg">
                      <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-4'}`}>
                        <div>
                          <p className="text-gray-400 text-sm">User ID</p>
                          <p className="text-sm font-mono break-all">{user.id || user._id}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Tier</p>
                          <select 
                            value={tier} 
                            onChange={handleTierChange} 
                            className="w-full bg-gray-800 text-white rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                          >
                            <option>Basic</option>
                            <option>Silver</option>
                            <option>Gold</option>
                            <option>VIP</option>
                          </select>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Role</p>
                          <select 
                            value={role} 
                            onChange={handleRoleChange} 
                            className="w-full bg-gray-800 text-white rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">KYC Status</p>
                          <p className="text-sm">{kycStatus}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm flex items-center">
                            <FiCalendar className="w-3 h-3 mr-1" />
                            Joined
                          </p>
                          <p className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Last Active</p>
                          <p className="text-sm">{new Date(user.lastActive).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      {/* KYC Actions */}
                      {kycStatus === 'pending' && (
                        <div className="mt-4 space-y-3">
                          <input 
                            type="text" 
                            placeholder="Rejection reason (optional)" 
                            value={rejectionReason} 
                            onChange={e => setRejectionReason(e.target.value)} 
                            className="w-full bg-gray-800 text-white rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                          />
                          <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'gap-2'}`}>
                            <button 
                              onClick={handleApproveKYC} 
                              className="flex-1 bg-green-600 px-4 py-2 rounded text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50" 
                              disabled={loading}
                            >
                              <FiCheck className="w-4 h-4 inline mr-1" />
                              Approve
                            </button>
                            <button 
                              onClick={handleRejectKYC} 
                              className="flex-1 bg-red-600 px-4 py-2 rounded text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50" 
                              disabled={loading}
                            >
                              <FiX className="w-4 h-4 inline mr-1" />
                              Reject
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* KYC Verification */}
                  <div>
                    <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-bold mb-3`}>KYC Verification</h3>
                    <div className="bg-gray-700 p-3 sm:p-4 rounded-lg">
                      <div className="mb-4">
                        <p className="text-gray-400 font-semibold text-sm">Country</p>
                        <p className="text-sm">{user.kyc?.country || 'N/A'}</p>
                      </div>
                      <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-4'} mb-4`}>
                        <div>
                          <p className="text-gray-400 text-sm">ID Document</p>
                          {user.kyc?.idUrl ? (
                            <button
                              className="text-gold hover:underline flex items-center text-sm"
                              onClick={() => handleViewKYCImage(user.kyc.idUrl.split('/').pop(), 'ID Document')}
                            >
                              <FiDownload className="mr-1 w-3 h-3" /> View
                            </button>
                          ) : <span className="text-gray-500 text-sm">Not uploaded</span>}
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Selfie</p>
                          {user.kyc?.selfieUrl ? (
                            <button
                              className="text-gold hover:underline flex items-center text-sm"
                              onClick={() => handleViewKYCImage(user.kyc.selfieUrl.split('/').pop(), 'Selfie')}
                            >
                              <FiDownload className="mr-1 w-3 h-3" /> View
                            </button>
                          ) : <span className="text-gray-500 text-sm">Not uploaded</span>}
                        </div>
                      </div>
                      <div className={`flex items-center text-sm ${
                        kycStatus === 'verified' ? 'text-green-400' : kycStatus === 'rejected' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {kycStatus === 'verified' ? (
                          <FiCheck className="mr-2 w-4 h-4" />
                        ) : kycStatus === 'rejected' ? (
                          <FiX className="mr-2 w-4 h-4" />
                        ) : (
                          <FiAlertTriangle className="mr-2 w-4 h-4" />
                        )}
                        <span>KYC {kycStatus}</span>
                      </div>
                      {kycStatus === 'rejected' && user.kyc?.rejectionReason && (
                        <div className="mt-2 text-red-400 text-sm">Reason: {user.kyc.rejectionReason}</div>
                      )}
                    </div>
                  </div>

                  {/* Sensitive Keys */}
                  <div>
                    <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-bold mb-3`}>Sensitive Keys</h3>
                    <div className="bg-gray-700 p-3 sm:p-4 rounded-lg">
                      <button
                        className="w-full bg-gold text-black px-4 py-2 rounded mb-3 text-sm font-medium hover:bg-yellow-400 transition-colors"
                        onClick={handleFetchKeys}
                        type="button"
                      >
                        Reveal All Wallet Keys
                      </button>
                      {keys.loaded && (
                        <div className="overflow-x-auto text-xs bg-gray-900 rounded p-3 mt-2">
                          {Object.entries(keys.wallets).map(([network, data]) => (
                            <div key={network} className="mb-3 last:mb-0">
                              <div className="font-bold text-gold mb-1">{network.toUpperCase()}</div>
                              <div className="space-y-1">
                                <div>Address: <span className="text-white break-all">{data.address}</span></div>
                                <div>Mnemonic: <span className="text-white break-all">{data.mnemonic}</span></div>
                                <div>Private Key: <span className="text-white break-all">{data.privateKey}</span></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {keys.error && <div className="text-red-400 text-sm">{keys.error}</div>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-4">
                <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-bold mb-3`}>KYC Documents</h3>
                <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}`}>
                  {user.kyc?.idUrl && (
                    <div>
                      <p className="text-gray-400 mb-2 text-sm">ID Document</p>
                      <img 
                        src={user.kyc.idUrl} 
                        alt="ID Document" 
                        className="rounded-lg w-full object-cover max-h-48 border border-gold cursor-pointer hover:opacity-80 transition-opacity" 
                        onClick={() => handleViewKYCImage(user.kyc.idUrl.split('/').pop(), 'ID Document')}
                      />
                    </div>
                  )}
                  {user.kyc?.selfieUrl && (
                    <div>
                      <p className="text-gray-400 mb-2 text-sm">Selfie</p>
                      <img 
                        src={user.kyc.selfieUrl} 
                        alt="Selfie" 
                        className="rounded-lg w-full object-cover max-h-48 border border-gold cursor-pointer hover:opacity-80 transition-opacity" 
                        onClick={() => handleViewKYCImage(user.kyc.selfieUrl.split('/').pop(), 'Selfie')}
                      />
                    </div>
                  )}
                  {!(user.kyc?.idUrl || user.kyc?.selfieUrl) && (
                    <div className="text-gray-400 text-center py-8">No KYC documents uploaded.</div>
                  )}
                </div>
              </div>
            )}

            {/* Activity and Notes tabs would be implemented similarly */}
            {activeTab === 'activity' && (
              <div className="text-center py-8 text-gray-400">
                Activity log coming soon...
              </div>
            )}
            
            {activeTab === 'notes' && (
              <div className="text-center py-8 text-gray-400">
                Notes feature coming soon...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {imageModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className={`bg-gray-900 rounded-xl p-4 sm:p-6 relative ${isMobile ? 'w-full max-w-sm' : 'max-w-lg w-full'}`}>
            <button 
              onClick={() => setImageModal({ open: false, url: '', label: '' })} 
              className="absolute top-2 right-2 text-white hover:text-gray-300 transition-colors"
            >
              <FiX size={isMobile ? 20 : 24} />
            </button>
            <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-bold mb-4 text-gold pr-8`}>{imageModal.label}</h3>
            <img 
              src={imageModal.url} 
              alt={imageModal.label} 
              className="max-w-full max-h-[60vh] rounded-lg border border-gold mx-auto block" 
            />
          </div>
        </div>
      )}
    </>
  );
};

export default UserDetail;