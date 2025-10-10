import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../auth/AdminAuthProvider';
import { updateAdminProfile, changeAdminPassword, updateAdminNotificationPrefs } from '../../services/adminAuthAPI';
import { FiUser, FiLock, FiBell, FiEdit2, FiSave, FiX, FiEye, FiEyeOff } from 'react-icons/fi';

const Settings = () => {
  const { admin, setAdmin } = useAdminAuth();
  const [profile, setProfile] = useState({ name: '', phone: '', country: '' });
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState(profile);
  const [profileMsg, setProfileMsg] = useState('');

  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [passwordMsg, setPasswordMsg] = useState('');

  const [notifPrefs, setNotifPrefs] = useState({ email: true, sms: false, push: true });
  const [notifMsg, setNotifMsg] = useState('');

  // Mobile detection
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Password visibility state
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (admin) {
      setProfile({ name: admin.name || '', phone: admin.phone || '', country: admin.country || '' });
      setForm({ name: admin.name || '', phone: admin.phone || '', country: admin.country || '' });
      setNotifPrefs(admin.notificationPrefs || { email: true, sms: false, push: true });
    }
  }, [admin]);

  const handleSaveProfile = async () => {
    setProfileMsg('');
    try {
      const res = await updateAdminProfile(form);
      setProfile(res.admin);
      setAdmin(res.admin);
      setEdit(false);
      setProfileMsg('Profile updated!');
    } catch (err) {
      setProfileMsg(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  const handleChangePassword = async () => {
    setPasswordMsg('');
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      setPasswordMsg('All fields are required.');
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setPasswordMsg('New passwords do not match.');
      return;
    }
    try {
      await changeAdminPassword(passwords.current, passwords.new);
      setPasswords({ current: '', new: '', confirm: '' });
      setPasswordMsg('Password changed successfully!');
    } catch (err) {
      setPasswordMsg(err.response?.data?.message || 'Failed to change password.');
    }
  };

  const handleSaveNotifPrefs = async () => {
    setNotifMsg('');
    try {
      const res = await updateAdminNotificationPrefs(notifPrefs);
      setNotifPrefs(res.notificationPrefs);
      setNotifMsg('Notification preferences updated!');
    } catch (err) {
      setNotifMsg(err.response?.data?.message || 'Failed to update notification preferences.');
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className={`${isMobile ? 'p-4 mx-2' : 'max-w-2xl mx-auto p-8'} bg-black bg-opacity-60 rounded-xl shadow-lg text-white overflow-x-auto`}>
      {/* Header */}
      <div className={`${isMobile ? 'mb-6' : 'mb-8'} text-center`}>
        <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gold flex items-center justify-center gap-2`}>
          <FiUser className={isMobile ? 'text-xl' : 'text-2xl'} />
          Admin Settings
        </h1>
      </div>

      {/* Profile Section */}
      <div className={`${isMobile ? 'mb-6' : 'mb-8'} bg-gray-900 bg-opacity-50 rounded-lg p-4`}>
        <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold mb-4 flex items-center gap-2`}>
          <FiUser className="text-gold" />
          Profile Information
        </h2>
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div className="relative">
            <input 
              className={`w-full ${isMobile ? 'p-3 text-sm' : 'p-4'} rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-gold outline-none transition-colors`}
              disabled={!edit} 
              value={edit ? form.name : profile.name} 
              onChange={e => setForm({ ...form, name: e.target.value })} 
              placeholder="Full Name" 
            />
          </div>
          <div className="relative">
            <input 
              className={`w-full ${isMobile ? 'p-3 text-sm' : 'p-4'} rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-gold outline-none transition-colors`}
              disabled={!edit} 
              value={edit ? form.phone : profile.phone} 
              onChange={e => setForm({ ...form, phone: e.target.value })} 
              placeholder="Phone Number" 
            />
          </div>
          <div className="relative">
            <input 
              className={`w-full ${isMobile ? 'p-3 text-sm' : 'p-4'} rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-gold outline-none transition-colors`}
              disabled={!edit} 
              value={edit ? form.country : profile.country} 
              onChange={e => setForm({ ...form, country: e.target.value })} 
              placeholder="Country" 
            />
          </div>
        </div>
        <div className={`flex ${isMobile ? 'flex-col gap-2' : 'gap-3'} mt-4`}>
          {edit ? (
            <>
              <button 
                className={`${isMobile ? 'w-full py-3' : 'px-6 py-2'} bg-gold text-black rounded-lg font-semibold hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2`}
                onClick={handleSaveProfile}
              >
                <FiSave />
                Save Changes
              </button>
              <button 
                className={`${isMobile ? 'w-full py-3' : 'px-6 py-2'} bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2`}
                onClick={() => setEdit(false)}
              >
                <FiX />
                Cancel
              </button>
            </>
          ) : (
            <button 
              className={`${isMobile ? 'w-full py-3' : 'px-6 py-2'} bg-gold text-black rounded-lg font-semibold hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2`}
              onClick={() => setEdit(true)}
            >
              <FiEdit2 />
              Edit Profile
            </button>
          )}
        </div>
        {profileMsg && (
          <div className={`mt-3 ${isMobile ? 'text-sm' : ''} text-blue-400 bg-blue-900 bg-opacity-30 p-3 rounded-lg`}>
            {profileMsg}
          </div>
        )}
      </div>

      {/* Password Change Section */}
      <div className={`${isMobile ? 'mb-6' : 'mb-8'} bg-gray-900 bg-opacity-50 rounded-lg p-4`}>
        <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold mb-4 flex items-center gap-2`}>
          <FiLock className="text-gold" />
          Change Password
        </h2>
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div className="relative">
            <input 
              type={showPasswords.current ? "text" : "password"}
              className={`w-full ${isMobile ? 'p-3 text-sm' : 'p-4'} pr-12 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-gold outline-none transition-colors`}
              value={passwords.current} 
              onChange={e => setPasswords({ ...passwords, current: e.target.value })} 
              placeholder="Current Password" 
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              onClick={() => togglePasswordVisibility('current')}
            >
              {showPasswords.current ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          <div className="relative">
            <input 
              type={showPasswords.new ? "text" : "password"}
              className={`w-full ${isMobile ? 'p-3 text-sm' : 'p-4'} pr-12 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-gold outline-none transition-colors`}
              value={passwords.new} 
              onChange={e => setPasswords({ ...passwords, new: e.target.value })} 
              placeholder="New Password" 
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              onClick={() => togglePasswordVisibility('new')}
            >
              {showPasswords.new ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          <div className="relative">
            <input 
              type={showPasswords.confirm ? "text" : "password"}
              className={`w-full ${isMobile ? 'p-3 text-sm' : 'p-4'} pr-12 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-gold outline-none transition-colors`}
              value={passwords.confirm} 
              onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} 
              placeholder="Confirm New Password" 
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              onClick={() => togglePasswordVisibility('confirm')}
            >
              {showPasswords.confirm ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>
        <button 
          className={`${isMobile ? 'w-full py-3' : 'px-6 py-2'} bg-gold text-black rounded-lg font-semibold hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2`}
          onClick={handleChangePassword}
        >
          <FiLock />
          Change Password
        </button>
        {passwordMsg && (
          <div className={`mt-3 ${isMobile ? 'text-sm' : ''} text-green-400 bg-green-900 bg-opacity-30 p-3 rounded-lg`}>
            {passwordMsg}
          </div>
        )}
      </div>

      {/* Notification Preferences */}
      <div className={`${isMobile ? 'mb-6' : 'mb-8'} bg-gray-900 bg-opacity-50 rounded-lg p-4`}>
        <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold mb-4 flex items-center gap-2`}>
          <FiBell className="text-gold" />
          Notification Preferences
        </h2>
        <div className={`${isMobile ? 'flex-col gap-3' : 'flex gap-6'} mb-4`}>
          <label className={`flex items-center gap-3 ${isMobile ? 'p-3 bg-gray-800 rounded-lg' : ''} cursor-pointer`}>
            <input 
              type="checkbox" 
              checked={notifPrefs.email} 
              onChange={e => setNotifPrefs(p => ({ ...p, email: e.target.checked }))}
              className="w-4 h-4 text-gold bg-gray-700 border-gray-600 rounded focus:ring-gold focus:ring-2"
            />
            <span className={isMobile ? 'text-sm' : ''}>Email Notifications</span>
          </label>
          <label className={`flex items-center gap-3 ${isMobile ? 'p-3 bg-gray-800 rounded-lg' : ''} cursor-pointer`}>
            <input 
              type="checkbox" 
              checked={notifPrefs.sms} 
              onChange={e => setNotifPrefs(p => ({ ...p, sms: e.target.checked }))}
              className="w-4 h-4 text-gold bg-gray-700 border-gray-600 rounded focus:ring-gold focus:ring-2"
            />
            <span className={isMobile ? 'text-sm' : ''}>SMS Notifications</span>
          </label>
          <label className={`flex items-center gap-3 ${isMobile ? 'p-3 bg-gray-800 rounded-lg' : ''} cursor-pointer`}>
            <input 
              type="checkbox" 
              checked={notifPrefs.push} 
              onChange={e => setNotifPrefs(p => ({ ...p, push: e.target.checked }))}
              className="w-4 h-4 text-gold bg-gray-700 border-gray-600 rounded focus:ring-gold focus:ring-2"
            />
            <span className={isMobile ? 'text-sm' : ''}>Push Notifications</span>
          </label>
        </div>
        <button 
          className={`${isMobile ? 'w-full py-3' : 'px-6 py-2'} bg-gold text-black rounded-lg font-semibold hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2`}
          onClick={handleSaveNotifPrefs}
        >
          <FiSave />
          Save Preferences
        </button>
        {notifMsg && (
          <div className={`mt-3 ${isMobile ? 'text-sm' : ''} text-green-400 bg-green-900 bg-opacity-30 p-3 rounded-lg`}>
            {notifMsg}
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
