import React, { useState, useEffect } from 'react';
import { FiSearch, FiRefreshCw, FiEye, FiTrash2, FiUserCheck, FiFile, FiImage, FiFileText, FiDownload, FiX, FiUser, FiCalendar, FiFolder } from 'react-icons/fi';

const SupportUploads = () => {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [preview, setPreview] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [reassignModal, setReassignModal] = useState(null);
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/support/uploads', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setUploads(data);
    } catch (error) {
      console.error('Error fetching uploads:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUpload = async (id) => {
    try {
      await fetch(`/api/admin/support/uploads/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setUploads(uploads.filter(u => u._id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting upload:', error);
    }
  };

  const reassignUpload = async (uploadId, newUserId) => {
    try {
      await fetch(`/api/admin/support/uploads/${uploadId}/reassign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ userId: newUserId })
      });
      fetchUploads();
      setReassignModal(null);
    } catch (error) {
      console.error('Error reassigning upload:', error);
    }
  };

  const searchUsers = async (query) => {
    if (!query) return;
    try {
      const response = await fetch(`/api/admin/users/search?q=${query}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return FiImage;
    if (['pdf'].includes(ext)) return FiFileText;
    return FiFile;
  };

  const filteredUploads = uploads.filter(upload =>
    upload.originalName.toLowerCase().includes(search.toLowerCase()) ||
    upload.userId.toLowerCase().includes(search.toLowerCase())
  );

  const UploadCard = ({ upload }) => {
    const FileIcon = getFileIcon(upload.originalName);
    
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-gold transition-colors">
        {/* File Preview/Icon */}
        <div className="aspect-square bg-gray-900 flex items-center justify-center relative">
          {upload.originalName.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
            <img 
              src={`/api/uploads/support/${upload.filename}`} 
              alt={upload.originalName}
              className="w-full h-full object-cover"
            />
          ) : (
            <FileIcon className="w-12 h-12 text-gray-400" />
          )}
          <div className="absolute top-2 right-2">
            <span className="bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
              {upload.originalName.split('.').pop().toUpperCase()}
            </span>
          </div>
        </div>

        {/* File Info */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="text-white font-medium text-sm truncate" title={upload.originalName}>
              {upload.originalName}
            </h3>
            <div className="flex items-center text-xs text-gray-400 mt-1">
              <FiUser className="w-3 h-3 mr-1" />
              <span className="truncate">{upload.userId}</span>
            </div>
            <div className="flex items-center text-xs text-gray-400 mt-1">
              <FiCalendar className="w-3 h-3 mr-1" />
              <span>{new Date(upload.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => setPreview(upload)}
              className="w-full px-3 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FiEye className="w-3 h-3 mr-1" />
              Preview
            </button>
            <div className="flex space-x-2">
              <button
                onClick={() => setReassignModal(upload)}
                className="flex-1 px-3 py-2 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FiUserCheck className="w-3 h-3 mr-1" />
                Reassign
              </button>
              <button
                onClick={() => setDeleteConfirm(upload)}
                className="flex-1 px-3 py-2 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FiTrash2 className="w-3 h-3 mr-1" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`max-w-full ${isMobile ? 'p-4' : 'p-2 sm:p-6'} w-full mx-auto`}>
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-900 px-6 py-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FiFolder className="w-6 h-6 text-gold" />
              <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gold`}>Support Uploads</h2>
            </div>
            <button
              onClick={fetchUploads}
              className="p-2 bg-gold text-black rounded-lg hover:bg-yellow-400 transition-colors"
              disabled={loading}
            >
              <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-gray-700">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by filename or user ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-gold outline-none text-sm"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <FiRefreshCw className="w-8 h-8 text-gold animate-spin" />
            </div>
          ) : filteredUploads.length === 0 ? (
            <div className="text-center py-12">
              <FiFolder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No uploads found</p>
            </div>
          ) : (
            <div className={`grid gap-4 ${
              isMobile 
                ? 'grid-cols-1 sm:grid-cols-2' 
                : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
            }`}>
              {filteredUploads.map(upload => (
                <UploadCard key={upload._id} upload={upload} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className={`bg-gray-800 rounded-lg border border-gray-700 ${isMobile ? 'w-full max-w-sm' : 'max-w-2xl w-full'} max-h-[90vh] overflow-hidden`}>
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-white font-medium truncate">{preview.originalName}</h3>
              <button
                onClick={() => setPreview(null)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[70vh]">
              {preview.originalName.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img 
                  src={`/api/uploads/support/${preview.filename}`} 
                  alt={preview.originalName}
                  className="w-full h-auto rounded"
                />
              ) : (
                <div className="text-center py-8">
                  <FiFile className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">Preview not available for this file type</p>
                  <a
                    href={`/api/uploads/support/${preview.filename}`}
                    download={preview.originalName}
                    className="inline-flex items-center mt-4 px-4 py-2 bg-gold text-black rounded hover:bg-yellow-400 transition-colors"
                  >
                    <FiDownload className="w-4 h-4 mr-2" />
                    Download
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className={`bg-gray-800 rounded-lg border border-gray-700 ${isMobile ? 'w-full max-w-sm' : 'max-w-md w-full'}`}>
            <div className="p-6">
              <h3 className="text-white font-medium mb-4">Confirm Delete</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete "{deleteConfirm.originalName}"? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteUpload(deleteConfirm._id)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reassign Modal */}
      {reassignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className={`bg-gray-800 rounded-lg border border-gray-700 ${isMobile ? 'w-full max-w-sm' : 'max-w-md w-full'}`}>
            <div className="p-6">
              <h3 className="text-white font-medium mb-4">Reassign Upload</h3>
              <p className="text-gray-300 mb-4">
                Reassigning "{reassignModal.originalName}"
              </p>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Search users by email or username..."
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    searchUsers(e.target.value);
                  }}
                  className="w-full px-3 py-2 rounded bg-gray-900 text-white border border-gray-600 focus:border-gold outline-none text-sm"
                />
                {users.length > 0 && (
                  <div className="max-h-40 overflow-y-auto border border-gray-600 rounded">
                    {users.map(user => (
                      <button
                        key={user._id}
                        onClick={() => reassignUpload(reassignModal._id, user._id)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-700 text-white text-sm border-b border-gray-600 last:border-b-0"
                      >
                        {user.email} ({user.username})
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setReassignModal(null)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportUploads;
