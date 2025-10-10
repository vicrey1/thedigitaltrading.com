import React, { useState, useEffect } from 'react';
import { sendAdminEmail } from '../../services/adminAPI';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { FiMail, FiSend, FiFileText, FiUser, FiEdit3, FiLoader } from 'react-icons/fi';

const AdminSendEmail = () => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('Welcome Email');
  const [richMessage, setRichMessage] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const templates = [
    {
      label: 'Welcome Email',
      subject: 'Welcome to THE DIGITAL TRADING!',
      html: `<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px 24px;background:#18181b;border-radius:16px;color:#fff;text-align:center;">
        <div style="font-family:sans-serif; font-size:2.5rem; font-weight:bold; letter-spacing:2px; margin-bottom:24px;">
          <span style="color:#FFD700;">LUX</span><span style="color:#fff;">HEDGE</span>
        </div>
        <h2 style="color:#FFD700;">Welcome to THE DIGITAL TRADING!</h2>
        <p>We're excited to have you on board. Explore investment opportunities and grow your wealth with us!</p>
      </div>`
    },
    {
      label: 'KYC Approved',
      subject: 'Your KYC is Approved!',
      html: `<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px 24px;background:#18181b;border-radius:16px;color:#fff;text-align:center;">
        <div style="font-family:sans-serif; font-size:2.5rem; font-weight:bold; letter-spacing:2px; margin-bottom:24px;">
          <span style="color:#FFD700;">LUX</span><span style="color:#fff;">HEDGE</span>
        </div>
        <h2 style="color:#FFD700;">KYC Approved</h2>
        <p>Your KYC verification is complete. You now have full access to all features!</p>
      </div>`
    },
    {
      label: 'Custom',
      subject: '',
      html: ''
    }
  ];

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    let finalHtml = html;
    if (selectedTemplate === 'Custom' && richMessage) {
      finalHtml = `<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px 24px;background:#18181b;border-radius:16px;color:#fff;text-align:center;">
        <div style="font-family:sans-serif; font-size:2.5rem; font-weight:bold; letter-spacing:2px; margin-bottom:24px;">
          <span style="color:#FFD700;">LUX</span><span style="color:#fff;">HEDGE</span>
        </div>
        <div style="font-size:1.1rem; color:#fff; margin:24px 0;">${richMessage}</div>
      </div>`;
    }
    try {
      await sendAdminEmail({ to, subject, html: finalHtml });
      setMessage('✅ Email sent successfully!');
      setTo(''); setSubject(''); setHtml(''); setRichMessage('');
    } catch (err) {
      setMessage('❌ Failed to send email: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (e) => {
    const template = templates.find(t => t.label === e.target.value);
    setSelectedTemplate(template.label);
    setSubject(template.subject);
    setHtml(template.html);
  };

  return (
    <div className={`max-w-full ${isMobile ? 'p-4' : 'sm:max-w-2xl p-2 sm:p-6'} w-full mx-auto`}>
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-900 px-6 py-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <FiMail className="w-6 h-6 text-gold" />
            <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gold`}>Send Email to User</h2>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSend} className="p-6 space-y-6">
          {/* Recipient */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-300">
              <FiUser className="w-4 h-4 mr-2" />
              To (User Email)
            </label>
            <input 
              type="email" 
              className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-gold outline-none text-sm"
              value={to} 
              onChange={e => setTo(e.target.value)} 
              placeholder="user@example.com"
              required 
            />
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-300">
              <FiEdit3 className="w-4 h-4 mr-2" />
              Subject
            </label>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-gold outline-none text-sm"
              value={subject} 
              onChange={e => setSubject(e.target.value)} 
              placeholder="Email subject"
              required 
            />
          </div>

          {/* Template Selection */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-300">
              <FiFileText className="w-4 h-4 mr-2" />
              Template
            </label>
            <select 
              className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-gold outline-none text-sm"
              value={selectedTemplate} 
              onChange={handleTemplateChange}
            >
              {templates.map(t => (
                <option key={t.label} value={t.label}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Rich Text Editor for Custom Template */}
          {selectedTemplate === 'Custom' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Rich Message</label>
              <div className="bg-gray-900 rounded-lg border border-gray-600 overflow-hidden">
                <ReactQuill 
                  theme="snow" 
                  value={richMessage} 
                  onChange={setRichMessage} 
                  className="text-white"
                  style={{
                    backgroundColor: '#111827',
                    color: 'white'
                  }}
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      ['link'],
                      ['clean']
                    ]
                  }}
                />
              </div>
            </div>
          )}

          {/* HTML Message for Non-Custom Templates */}
          {selectedTemplate !== 'Custom' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">HTML Message</label>
              <textarea 
                className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-gold outline-none text-sm min-h-[120px] resize-y"
                value={html} 
                onChange={e => setHtml(e.target.value)} 
                placeholder="HTML content for the email"
                required 
              />
            </div>
          )}

          {/* Send Button */}
          <button 
            type="submit" 
            className="w-full px-6 py-3 bg-gold text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <FiSend className="w-4 h-4 mr-2" />
                Send Email
              </>
            )}
          </button>

          {/* Status Message */}
          {message && (
            <div className={`text-center p-3 rounded-lg text-sm font-medium ${
              message.includes('✅') 
                ? 'bg-green-900 bg-opacity-20 text-green-400 border border-green-600' 
                : 'bg-red-900 bg-opacity-20 text-red-400 border border-red-600'
            }`}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AdminSendEmail;
