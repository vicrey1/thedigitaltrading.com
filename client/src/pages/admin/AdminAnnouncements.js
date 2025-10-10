import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { FiTrash2, FiInfo, FiClock } from 'react-icons/fi';
import '../Announcements.css';

const AdminAnnouncements = () => {
  console.log('AdminAnnouncements rendered');
  const [title, setTitle] = useState('');
  const [richMessage, setRichMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const quillRef = useRef();

  // Check if mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch announcements
  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get('/api/admin/announcements', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Fetched announcements:', res.data.announcements);
      setAnnouncements(res.data.announcements || []);
    } catch (err) {
      setAnnouncements([]);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post('/api/admin/announcements', { title, message: richMessage }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Announcement posted!');
      setTitle('');
      setRichMessage('');
      fetchAnnouncements();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post announcement');
    } finally {
      setLoading(false);
    }
  };

  // Delete announcement
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    setDeletingId(id);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`/api/admin/announcements/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchAnnouncements(); // Always re-fetch after delete
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete announcement');
    } finally {
      setDeletingId(null);
    }
  };

  // Mobile-optimized toolbar for Quill
  const quillModules = {
    toolbar: isMobile ? [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic'],
      [{ 'color': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ] : [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ]
  };

  const handleExternalImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);
      const token = localStorage.getItem('adminToken');
      console.log('adminToken for image upload:', token);
      try {
        const res = await axios.post('/api/upload-announcement-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
        });
        if (!res.data.url) throw new Error('No image URL returned');
        const imageUrl = res.data.url.startsWith('http')
          ? res.data.url
          : `${window.location.origin.replace(':3000', ':5001')}${res.data.url}`;
        if (!quillRef.current) return;
        const quill = quillRef.current.getEditor();
        quill.focus();
        setTimeout(() => {
          let range = quill.getSelection();
          if (!range) {
            range = { index: quill.getLength() - 1 };
          }
          quill.insertEmbed(range.index, 'image', imageUrl);
          quill.setSelection(range.index + 1, 0);
        }, 0);
        e.target.value = '';
      } catch (err) {
        console.error('Image upload failed:', err);
        alert('Image upload failed');
      }
    }
  };

  return (
    <div className="p-2 sm:p-3 md:p-4 lg:p-6 max-w-full lg:max-w-6xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gold">
            Announcement Management
          </h1>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
          <span className="text-gray-400">
            Total: <span className="text-gold font-medium">{announcements.length}</span> announcements
          </span>
        </div>
      </div>
      
      {/* Post form */}
      <div className="glassmorphic p-2 sm:p-3 md:p-4 lg:p-6 rounded-xl mb-3 sm:mb-4 md:mb-6">
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 md:mb-6 text-center">
          Post Announcement
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-6">
          <div>
            <label className="block mb-1.5 sm:mb-2 text-sm sm:text-base font-medium">Title</label>
            <input 
              type="text" 
              className="w-full p-2.5 sm:p-3 md:p-4 rounded-lg bg-dark border border-gray-700 text-white focus:border-gold focus:outline-none transition-colors text-sm sm:text-base" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
              placeholder="Enter announcement title..."
            />
          </div>
          
          <div>
            <label className="block mb-1.5 sm:mb-2 text-sm sm:text-base font-medium">Message</label>
            <div className="bg-dark rounded-lg overflow-hidden">
              <ReactQuill 
                theme="snow" 
                value={richMessage} 
                onChange={setRichMessage} 
                className={`bg-dark text-white ${isMobile ? 'min-h-[150px]' : 'min-h-[200px] sm:min-h-[250px]'}`}
                modules={quillModules}
                ref={quillRef}
                placeholder="Write your announcement message..."
              />
            </div>
            
            {!isMobile && (
              <div className="mt-2 sm:mt-3">
                <label className="block mb-1.5 sm:mb-2 text-sm font-medium">Insert Image:</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleExternalImageUpload} 
                  className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gold file:text-black file:font-medium hover:file:bg-yellow-600 transition-colors" 
                  onClick={e => e.stopPropagation()} 
                />
              </div>
            )}
          </div>
          
          <button 
            type="submit" 
            className="w-full py-2.5 sm:py-3 md:py-4 rounded-lg font-bold bg-gold text-black hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base" 
            disabled={loading}
          >
            {loading ? 'Posting...' : 'Post Announcement'}
          </button>
          
          {success && (
            <div className="text-green-400 text-center mt-2 sm:mt-3 p-2 sm:p-3 bg-green-900/20 rounded-lg text-xs sm:text-sm md:text-base">
              {success}
            </div>
          )}
          {error && (
            <div className="text-red-400 text-center mt-2 sm:mt-3 p-2 sm:p-3 bg-red-900/20 rounded-lg text-xs sm:text-sm md:text-base">
              {error}
            </div>
          )}
        </form>
      </div>
      
      {/* Announcements list */}
      <div className="space-y-2 sm:space-y-3 md:space-y-4">
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-center mb-3 sm:mb-4 text-gold">
          Published Announcements
        </h3>
        
        {announcements.filter(a => a._id).map((a) => (
          <div key={a._id} className="glassmorphic p-2 sm:p-3 md:p-4 lg:p-6 rounded-xl relative">
            <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2 sm:gap-3">
              <div className="flex items-start gap-1.5 sm:gap-2 flex-1 min-w-0">
                <FiInfo className="text-gold mt-0.5 sm:mt-1 flex-shrink-0" size={isMobile ? 14 : 16} />
                <h4 className="font-bold text-sm sm:text-base md:text-lg text-gold break-words">
                  {a.title}
                </h4>
              </div>
              
              {a._id && (
                <button
                  className="text-red-400 hover:text-red-600 p-1.5 sm:p-2 rounded-lg hover:bg-red-900/20 transition-colors flex-shrink-0"
                  title="Delete announcement"
                  onClick={() => handleDelete(a._id)}
                  disabled={deletingId === a._id}
                >
                  <FiTrash2 size={isMobile ? 14 : 16} />
                </button>
              )}
            </div>
            
            <div 
              className="text-white mb-2 sm:mb-3 announcement-message prose prose-invert max-w-none text-xs sm:text-sm md:text-base leading-relaxed" 
              dangerouslySetInnerHTML={{ __html: a.message }} 
            />
            
            <div className="flex items-center text-gray-400 text-xs">
              <FiClock className="mr-1.5 sm:mr-2 flex-shrink-0" size={isMobile ? 10 : 12} />
              <span className="break-words">
                {a.date ? (new Date(a.date)).toLocaleString() : ''}
              </span>
            </div>
          </div>
        ))}
        
        {announcements.filter(a => a._id).length === 0 && (
          <div className="text-center text-gray-400 py-6 sm:py-8 md:py-12">
            <FiInfo className="mx-auto mb-2 sm:mb-3 text-2xl sm:text-3xl md:text-4xl" />
            <p className="text-xs sm:text-sm md:text-base">No announcements yet.</p>
            <p className="text-xs mt-1">Create your first announcement above.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnnouncements;
