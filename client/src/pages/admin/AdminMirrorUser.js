import React, { useState, useEffect } from 'react';
import Portfolio from '../../pages/Portfolio';
import Dashboard from '../../pages/Dashboard';
import Settings from '../../pages/Settings';
import KYCPage from '../../pages/KYCPage';
import { 
  getUserKeys, 
  getUserPortfolio, 
  getUserProfile, 
  getUserKYC,
  completeActiveInvestment,
  continueCompletedInvestment
} from '../../services/adminAPI';
import { FiArrowLeft, FiUser, FiPieChart, FiSettings, FiFileText, FiInfo, FiEye, FiEyeOff, FiCopy, FiCheck, FiX } from 'react-icons/fi';

const AdminMirrorUser = ({ userId, onBack, isMobile }) => {
  const [portfolioData, setPortfolioData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [kyc, setKyc] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [keys, setKeys] = useState(null);
  const [showKeys, setShowKeys] = useState(false);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [errorKeys, setErrorKeys] = useState('');
  const [copiedField, setCopiedField] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [portfolioData, profileData, kycData] = await Promise.all([
          getUserPortfolio(userId),
          getUserProfile(userId),
          getUserKYC(userId)
        ]);
        setPortfolioData(portfolioData);
        setProfile(profileData);
        setKyc(kycData);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setPortfolioData(null);
        setProfile(null);
        setKyc(null);
      }
    };
    fetchAll();
  }, [userId]);

  // Copy to clipboard function
  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 2000);
    });
  };

  // Handler for completing active investment
  const handleCompleteActiveInvestment = async () => {
    if (!userId) return;
    try {
      await completeActiveInvestment(userId);
      // Refresh portfolio data after completion
      const portfolioData = await getUserPortfolio(userId);
      setPortfolioData(portfolioData);
      alert('Active investment completed successfully.');
    } catch (err) {
      alert('Failed to complete active investment: ' + (err.response?.data?.error || err.message));
    }
  };

  // Handler for continuing completed investment
  const handleContinueCompletedInvestment = async () => {
    if (!userId) return;
    try {
      await continueCompletedInvestment(userId);
      // Refresh portfolio data after continuation
      const portfolioData = await getUserPortfolio(userId);
      setPortfolioData(portfolioData);
      alert('Investment continued successfully.');
    } catch (err) {
      alert('Failed to continue investment: ' + (err.response?.data?.error || err.message));
    }
  };

  // Handler to fetch wallet keys
  const handleRevealKeys = async () => {
    setLoadingKeys(true);
    setErrorKeys('');
    try {
      const data = await getUserKeys(userId);
      setKeys(data.wallets);
      setShowKeys(true);
    } catch (err) {
      setErrorKeys('Failed to fetch wallet keys.');
    } finally {
      setLoadingKeys(false);
    }
  };

  // Helper: get KYC info
  const kycInfo = profile?.kyc || {};
  const kycStatus = kycInfo.status || kyc?.kycStatus || 'not_submitted';

  // Helper: portfolio summary
  const summary = portfolioData?.summary || {};
  const userInfo = portfolioData?.userInfo || {};
  const investments = portfolioData?.investments || [];

  // Tab configuration with icons
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: FiPieChart },
    { id: 'portfolio', label: 'Portfolio', icon: FiUser },
    { id: 'settings', label: 'Settings', icon: FiSettings },
    { id: 'kyc', label: 'KYC', icon: FiFileText },
    { id: 'details', label: 'Details', icon: FiInfo }
  ];

  return (
    <div className={`${isMobile ? 'p-2' : 'p-4 md:p-6'} overflow-auto w-full min-h-screen`}>
      {/* Header with Back Button */}
      <div className={`${isMobile ? 'mb-3' : 'mb-4'} flex items-center gap-3`}>
        <button 
          className={`${isMobile ? 'p-2' : 'px-4 py-2'} bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2 transition-colors`} 
          onClick={onBack}
        >
          <FiArrowLeft className={isMobile ? 'text-lg' : 'text-base'} />
          {!isMobile && 'Back to User List'}
        </button>
        {profile && (
          <div className="flex-1">
            <h1 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-gold truncate`}>
              {profile.name || profile.username || 'User'} ({profile._id?.slice(-6)})
            </h1>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className={`${isMobile ? 'mb-4' : 'mb-6'} w-full`}>
        {isMobile ? (
          // Mobile: Dropdown selector
          <select 
            value={tab} 
            onChange={(e) => setTab(e.target.value)}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-gold outline-none"
          >
            {tabs.map(({ id, label }) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
        ) : (
          // Desktop: Tab buttons
          <div className="flex flex-wrap gap-2 overflow-x-auto">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button 
                key={id}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 min-w-[120px] transition-colors ${
                  tab === id 
                    ? 'bg-gold text-black font-semibold' 
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`} 
                onClick={() => setTab(id)}
              >
                <Icon className="text-sm" />
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tab Content */}
      {tab === 'dashboard' && <Dashboard adminView portfolioData={portfolioData} />}
      
      {tab === 'portfolio' && (
        <div className="space-y-4">
          {/* Investment Control Buttons */}
          <div className={`${isMobile ? 'flex flex-col gap-2' : 'flex gap-4'}`}>
            <button
              className={`${isMobile ? 'w-full py-3' : 'px-4 py-2'} bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50`}
              onClick={handleCompleteActiveInvestment}
              disabled={!portfolioData || !portfolioData.investments?.some(inv => inv.status === 'active')}
            >
              Complete Active Investment
            </button>
            <button
              className={`${isMobile ? 'w-full py-3' : 'px-4 py-2'} bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50`}
              onClick={handleContinueCompletedInvestment}
              disabled={!portfolioData || !portfolioData.investments?.some(inv => inv.status === 'completed')}
            >
              Continue Completed Investment
            </button>
          </div>
          <Portfolio adminView portfolioData={portfolioData} />
        </div>
      )}
      
      {tab === 'settings' && <Settings adminView profile={profile} />}
      {tab === 'kyc' && <KYCPage adminView kyc={kyc} />}
      
      {tab === 'details' && (
        <div className={`glassmorphic ${isMobile ? 'p-4' : 'p-6'} rounded-xl ${isMobile ? 'w-full' : 'max-w-4xl'} mx-auto space-y-6`}>
          <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gold flex items-center gap-2`}>
            <FiInfo />
            User Details
          </h2>
          
          {/* User Information Grid */}
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-4'}`}>
            {[
              { label: 'User ID', value: profile?._id || '-' },
              { label: 'Tier', value: profile?.tier || '-' },
              { label: 'Role', value: profile?.role || '-' },
              { label: 'Joined', value: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '-' },
              { label: 'Last Active', value: profile?.lastActive && !isNaN(Date.parse(profile.lastActive)) ? new Date(profile.lastActive).toLocaleDateString() : '-' },
              { label: 'Account Balance', value: `$${Number(userInfo.availableBalance ?? 0).toLocaleString()}` },
              { label: 'Total Invested', value: `$${Number(summary.totalInvested ?? 0).toLocaleString()}` },
              { label: 'Total ROI', value: `$${Number(summary.totalROI ?? 0).toLocaleString()}` },
              { label: 'Active Investments', value: investments.filter(inv => inv.status === 'active').length.toString() }
            ].map(({ label, value }) => (
              <div key={label} className={`${isMobile ? 'p-3' : 'p-4'} bg-gray-900 rounded-lg border border-gray-800`}>
                <div className="text-gray-400 text-sm mb-1">{label}</div>
                <div className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-white break-all`}>{value}</div>
              </div>
            ))}
          </div>

          {/* KYC Verification Section */}
          <div className={`${isMobile ? 'p-4' : 'p-6'} bg-gray-900 rounded-lg border border-gray-800 space-y-3`}>
            <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-gold flex items-center gap-2`}>
              <FiFileText />
              KYC Verification
            </h3>
            <div className="space-y-2">
              {[
                { label: 'Country', value: kycInfo.country || '-' },
                { label: 'Document Type', value: kycInfo.documentType || '-' }
              ].map(({ label, value }) => (
                <div key={label} className={`${isMobile ? 'text-sm' : 'text-base'}`}>
                  <span className="text-gray-400">{label}: </span>
                  <span className="font-bold text-white">{value}</span>
                </div>
              ))}
              
              {/* Document Links */}
              <div className="space-y-2">
                {[
                  { label: 'ID Front', url: kycInfo.idFront },
                  { label: 'ID Back', url: kycInfo.idBack },
                  { label: 'Selfie', url: kycInfo.selfie }
                ].map(({ label, url }) => (
                  <div key={label} className={`${isMobile ? 'text-sm' : 'text-base'}`}>
                    <span className="text-gray-400">{label}: </span>
                    {url ? (
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-gold underline hover:text-yellow-400">
                        View
                      </a>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </div>
                ))}
              </div>
              
              <div className={`${isMobile ? 'text-sm' : 'text-base'}`}>
                <span className="text-gray-400">KYC Status: </span>
                <span className={`font-bold ${
                  kycStatus === 'verified' ? 'text-green-400' : 
                  kycStatus === 'pending' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {kycStatus.charAt(0).toUpperCase() + kycStatus.slice(1)}
                </span>
              </div>
              
              {kycInfo.rejectionReason && (
                <div className={`${isMobile ? 'text-sm' : 'text-base'} text-red-400`}>
                  <span className="text-gray-400">Rejection Reason: </span>
                  {kycInfo.rejectionReason}
                </div>
              )}
            </div>
          </div>

          {/* Sensitive Keys Section */}
          <div className={`${isMobile ? 'p-4' : 'p-6'} bg-gray-900 rounded-lg border border-gray-800 space-y-4`}>
            <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-gold flex items-center gap-2`}>
              <FiEye />
              Sensitive Keys
            </h3>
            
            <button
              className={`${isMobile ? 'w-full py-3' : 'px-6 py-3'} bg-gold text-black rounded-lg font-bold hover:bg-yellow-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2`}
              onClick={handleRevealKeys}
              disabled={loadingKeys}
            >
              {loadingKeys ? (
                <>Loading...</>
              ) : showKeys ? (
                <>
                  <FiEyeOff />
                  Refresh Wallet Keys
                </>
              ) : (
                <>
                  <FiEye />
                  Reveal All Wallet Keys
                </>
              )}
            </button>
            
            {errorKeys && (
              <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-800">
                {errorKeys}
              </div>
            )}
            
            {showKeys && keys && (
              <div className={`${isMobile ? 'text-xs' : 'text-sm'} bg-black rounded-lg ${isMobile ? 'p-3' : 'p-4'} space-y-4 border border-gray-700`}>
                {Object.entries(keys).map(([network, data]) => (
                  <div key={network} className="space-y-2">
                    <div className="font-bold text-gold text-base">{network.toUpperCase()}</div>
                    
                    {/* Address */}
                    <div className="space-y-1">
                      <div className="text-gray-400">Address:</div>
                      <div className="flex items-center gap-2 bg-gray-900 p-2 rounded border">
                        <span className="text-white font-mono break-all flex-1">{data.address}</span>
                        <button
                          onClick={() => copyToClipboard(data.address, `${network}-address`)}
                          className="text-gold hover:text-yellow-400 transition-colors p-1"
                          title="Copy address"
                        >
                          {copiedField === `${network}-address` ? <FiCheck /> : <FiCopy />}
                        </button>
                      </div>
                    </div>
                    
                    {/* Mnemonic */}
                    <div className="space-y-1">
                      <div className="text-gray-400">Mnemonic:</div>
                      <div className="flex items-center gap-2 bg-gray-900 p-2 rounded border">
                        <span className="text-white font-mono break-all flex-1">{data.mnemonic}</span>
                        <button
                          onClick={() => copyToClipboard(data.mnemonic, `${network}-mnemonic`)}
                          className="text-gold hover:text-yellow-400 transition-colors p-1"
                          title="Copy mnemonic"
                        >
                          {copiedField === `${network}-mnemonic` ? <FiCheck /> : <FiCopy />}
                        </button>
                      </div>
                    </div>
                    
                    {/* Private Key */}
                    <div className="space-y-1">
                      <div className="text-gray-400">Private Key:</div>
                      <div className="flex items-center gap-2 bg-gray-900 p-2 rounded border">
                        <span className="text-white font-mono break-all flex-1">{data.privateKey}</span>
                        <button
                          onClick={() => copyToClipboard(data.privateKey, `${network}-privatekey`)}
                          className="text-gold hover:text-yellow-400 transition-colors p-1"
                          title="Copy private key"
                        >
                          {copiedField === `${network}-privatekey` ? <FiCheck /> : <FiCopy />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMirrorUser;
