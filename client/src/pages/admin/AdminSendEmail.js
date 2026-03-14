import React, { useState, useEffect } from 'react';
import { sendAdminEmail } from '../../services/adminAPI';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { EmailPreviewService } from '../../services/emailPreview';
import { 
  FiMail, 
  FiUser, 
  FiEdit3, 
  FiFileText, 
  FiSend, 
  FiLoader,
  FiLayout,
  FiType,
  FiCode,
  FiEye,
  FiCheckCircle,
  FiBell,
  FiSettings,
  FiGift,
  FiShield,
  FiAlertCircle
} from 'react-icons/fi';

const AdminSendEmail = () => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('welcome');
  const [showPreview, setShowPreview] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Template-specific data
  const [templateData, setTemplateData] = useState({
    userName: '',
    customMessage: '',
    title: '',
    buttonText: '',
    buttonUrl: '',
    type: 'info'
  });

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
      id: 'welcome',
      label: 'Welcome Email',
      icon: FiGift,
      description: 'Welcome new users to the platform',
      defaultSubject: 'Welcome to THE DIGITAL TRADING!',
      color: 'from-green-500 to-emerald-600',
      fields: ['userName', 'customMessage']
    },
    {
      id: 'kyc-approved',
      label: 'KYC Approved',
      icon: FiShield,
      description: 'Notify users of successful KYC verification',
      defaultSubject: 'Your KYC Verification is Approved!',
      color: 'from-blue-500 to-cyan-600',
      fields: ['userName']
    },
    {
      id: 'notification',
      label: 'Notification',
      icon: FiAlertCircle,
      description: 'Send important notifications',
      defaultSubject: 'Important Notification',
      color: 'from-orange-500 to-amber-600',
      fields: ['title', 'type']
    },
    {
      id: 'custom',
      label: 'Custom Message',
      icon: FiEdit3,
      description: 'Create a custom email with rich content',
      defaultSubject: 'Message from THE DIGITAL TRADING',
      color: 'from-purple-500 to-indigo-600',
      fields: ['title', 'buttonText', 'buttonUrl']
    }
  ];

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const emailData = {
        to,
        subject,
        template: selectedTemplate,
        templateData: {
          ...templateData,
          message: selectedTemplate === 'custom' ? message : templateData.customMessage || message
        }
      };

      // Add HTML content for custom template
      if (selectedTemplate === 'custom') {
        emailData.html = message;
      }

      await sendAdminEmail(emailData);
      setMessage('✅ Email sent successfully!');
      
      // Reset form
      setTo('');
      setSubject('');
      setMessage('');
      setTemplateData({
        userName: '',
        customMessage: '',
        title: '',
        buttonText: '',
        buttonUrl: '',
        type: 'info'
      });
    } catch (err) {
      setMessage('❌ Failed to send email: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    setSelectedTemplate(templateId);
    setSubject(template.defaultSubject);
    setShowPreview(false);
    
    // Reset template data
    setTemplateData({
      userName: '',
      customMessage: '',
      title: '',
      buttonText: '',
      buttonUrl: '',
      type: 'info'
    });
  };

  const updateTemplateData = (field, value) => {
    setTemplateData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getSelectedTemplate = () => {
    return templates.find(t => t.id === selectedTemplate);
  };

  const renderTemplateFields = () => {
    const template = getSelectedTemplate();
    if (!template) return null;

    return (
      <div className="space-y-4">
        {template.fields.includes('userName') && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              User Name
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-gold outline-none text-sm"
              value={templateData.userName}
              onChange={(e) => updateTemplateData('userName', e.target.value)}
              placeholder="Enter user's name"
            />
          </div>
        )}

        {template.fields.includes('title') && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Email Title
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-gold outline-none text-sm"
              value={templateData.title}
              onChange={(e) => updateTemplateData('title', e.target.value)}
              placeholder="Enter email title"
            />
          </div>
        )}

        {template.fields.includes('type') && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Notification Type
            </label>
            <select
              className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-gold outline-none text-sm"
              value={templateData.type}
              onChange={(e) => updateTemplateData('type', e.target.value)}
            >
              <option value="info">Information</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
        )}

        {template.fields.includes('buttonText') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Button Text (Optional)
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-gold outline-none text-sm"
                value={templateData.buttonText}
                onChange={(e) => updateTemplateData('buttonText', e.target.value)}
                placeholder="e.g., Get Started"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Button URL (Optional)
              </label>
              <input
                type="url"
                className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-gold outline-none text-sm"
                value={templateData.buttonUrl}
                onChange={(e) => updateTemplateData('buttonUrl', e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>
        )}

        {template.fields.includes('customMessage') && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Custom Message (Optional)
            </label>
            <textarea
              className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-gold outline-none text-sm min-h-[100px] resize-y"
              value={templateData.customMessage}
              onChange={(e) => updateTemplateData('customMessage', e.target.value)}
              placeholder="Add a personal message..."
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-gold to-yellow-400 bg-clip-text text-transparent">
            Send Email to User
          </h1>
          <p className="text-gray-400">Create and send professional emails with our enhanced template system</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Email Composition Panel */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <FiMail className="mr-2 text-gold" />
              Email Composition
            </h2>
            
            <form onSubmit={handleSend} className="space-y-6">
              {/* Recipient */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300 flex items-center">
                  <FiUser className="mr-2" />
                  To (User Email)
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-gold outline-none text-sm"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  required
                  placeholder="user@example.com"
                />
              </div>

              {/* Template Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300 flex items-center">
                  <FiLayout className="mr-2" />
                  Email Template
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => handleTemplateChange(template.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedTemplate === template.id
                          ? `border-${template.color} bg-${template.color}/10`
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center mb-2">
                        <template.icon className={`text-${template.color} mr-2`} size={20} />
                        <span className="font-medium text-sm">{template.label}</span>
                      </div>
                      <p className="text-xs text-gray-400">{template.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300 flex items-center">
                  <FiType className="mr-2" />
                  Subject
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-gold outline-none text-sm"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder="Email subject"
                />
              </div>

              {/* Template Fields */}
              {renderTemplateFields()}

              {/* Custom HTML for Custom Template */}
              {selectedTemplate === 'custom' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 flex items-center">
                    <FiCode className="mr-2" />
                    HTML Message
                  </label>
                  <ReactQuill
                    theme="snow"
                    value={message}
                    onChange={setMessage}
                    placeholder="HTML content for the email"
                    style={{
                      backgroundColor: '#111827',
                      color: 'white',
                      borderRadius: '8px',
                      border: '1px solid #4b5563'
                    }}
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, false] }],
                        ['bold', 'italic', 'underline'],
                        ['link', 'image'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['clean']
                      ],
                    }}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                >
                  <FiEye className="mr-2" />
                  {showPreview ? 'Hide Preview' : 'Preview Email'}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gold hover:bg-yellow-600 text-black font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  <FiSend className="mr-2" />
                  {loading ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </form>

            {/* Status Message */}
            {message && (
              <div className={`mt-6 p-4 rounded-lg text-center ${
                message.includes('✅') ? 'bg-green-900/50 border border-green-600' : 'bg-red-900/50 border border-red-600'
              }`}>
                {message}
              </div>
            )}
          </div>

          {/* Preview Panel */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <FiEye className="mr-2 text-gold" />
              Email Preview
            </h2>
            
            {showPreview ? (
              <div className="bg-white rounded-lg p-1 min-h-[500px]">
                <iframe
                  srcDoc={EmailPreviewService.generatePreview(selectedTemplate, {
                    ...templateData,
                    message: selectedTemplate === 'custom' ? message : templateData.customMessage
                  })}
                  className="w-full h-[500px] border-0 rounded-lg"
                  title="Email Preview"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-[500px] bg-gray-900 rounded-lg border-2 border-dashed border-gray-600">
                <div className="text-center">
                  <FiEye className="mx-auto text-gray-500 mb-4" size={48} />
                  <p className="text-gray-400 mb-2">Email Preview</p>
                  <p className="text-sm text-gray-500">Click "Preview Email" to see how your email will look</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSendEmail;
