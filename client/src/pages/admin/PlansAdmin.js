// src/pages/admin/PlansAdmin.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PlansAdmin = () => {
  const [plans, setPlans] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', percentReturn: 150, durationDays: 4, minInvestment: 10, maxInvestment: 10000, isActive: true });
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    const res = await axios.get('/api/admin/plans', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    setPlans(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchPlans(); }, []);

  const handleEdit = (plan) => {
    setEditing(plan._id);
    setForm({ ...plan });
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/admin/plans/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    fetchPlans();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await axios.put(`/api/admin/plans/${editing}`, form, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    } else {
      await axios.post('/api/admin/plans', form, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    }
    setEditing(null);
    setForm({ name: '', percentReturn: 150, durationDays: 4, minInvestment: 10, maxInvestment: 10000, isActive: true });
    fetchPlans();
  };

  const PlanCard = ({ plan }) => (
    <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gold">{plan.name}</h3>
        <span className={`px-2 py-1 rounded text-xs ${plan.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {plan.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div>
          <span className="text-gray-400">Return:</span>
          <div className="font-semibold">{plan.percentReturn}%</div>
        </div>
        <div>
          <span className="text-gray-400">Duration:</span>
          <div className="font-semibold">{plan.durationDays} days</div>
        </div>
        <div>
          <span className="text-gray-400">Min:</span>
          <div className="font-semibold">${plan.minInvestment}</div>
        </div>
        <div>
          <span className="text-gray-400">Max:</span>
          <div className="font-semibold">${plan.maxInvestment}</div>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button 
          className="flex-1 bg-blue-600 text-white px-3 py-2 rounded font-medium hover:bg-blue-700 transition text-sm"
          onClick={() => handleEdit(plan)}
        >
          Edit
        </button>
        <button 
          className="flex-1 bg-red-600 text-white px-3 py-2 rounded font-medium hover:bg-red-700 transition text-sm"
          onClick={() => handleDelete(plan._id)}
        >
          Delete
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto p-3 sm:p-4 md:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center sm:text-left">Investment Plans Admin</h1>
      
      {/* Form Section */}
      <div className="bg-gray-900 rounded-lg p-4 sm:p-6 mb-6 border border-gray-700">
        <h2 className="text-lg font-semibold mb-4 text-gold">
          {editing ? 'Edit Plan' : 'Create New Plan'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Plan Name</label>
              <input 
                className="w-full p-3 sm:p-2 border rounded-lg bg-gray-800 text-white border-gray-600 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition text-base sm:text-sm" 
                placeholder="Enter plan name" 
                value={form.name} 
                onChange={e => setForm({ ...form, name: e.target.value })} 
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Return Percentage</label>
              <input 
                className="w-full p-3 sm:p-2 border rounded-lg bg-gray-800 text-white border-gray-600 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition text-base sm:text-sm" 
                type="number" 
                placeholder="% Return" 
                value={form.percentReturn} 
                onChange={e => setForm({ ...form, percentReturn: e.target.value })} 
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Duration (Days)</label>
              <input 
                className="w-full p-3 sm:p-2 border rounded-lg bg-gray-800 text-white border-gray-600 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition text-base sm:text-sm" 
                type="number" 
                placeholder="Duration in days" 
                value={form.durationDays} 
                onChange={e => setForm({ ...form, durationDays: e.target.value })} 
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Min Investment</label>
              <input 
                className="w-full p-3 sm:p-2 border rounded-lg bg-gray-800 text-white border-gray-600 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition text-base sm:text-sm" 
                type="number" 
                placeholder="Minimum amount" 
                value={form.minInvestment} 
                onChange={e => setForm({ ...form, minInvestment: e.target.value })} 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Max Investment</label>
              <input 
                className="w-full p-3 sm:p-2 border rounded-lg bg-gray-800 text-white border-gray-600 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition text-base sm:text-sm" 
                type="number" 
                placeholder="Maximum amount" 
                value={form.maxInvestment} 
                onChange={e => setForm({ ...form, maxInvestment: e.target.value })} 
              />
            </div>
            
            <div className="flex items-center">
              <label className="flex items-center gap-3 text-white cursor-pointer p-2">
                <input 
                  type="checkbox" 
                  checked={form.isActive} 
                  onChange={e => setForm({ ...form, isActive: e.target.checked })} 
                  className="w-4 h-4 text-gold bg-gray-800 border-gray-600 rounded focus:ring-gold focus:ring-2"
                />
                <span className="text-sm sm:text-base">Plan is Active</span>
              </label>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button 
              className="w-full sm:w-auto bg-gold text-black px-6 py-3 sm:py-2 rounded-lg font-semibold hover:bg-yellow-400 transition text-base sm:text-sm" 
              type="submit"
            >
              {editing ? 'Update Plan' : 'Create Plan'}
            </button>
            {editing && (
              <button 
                className="w-full sm:w-auto px-6 py-3 sm:py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition text-base sm:text-sm" 
                type="button"
                onClick={() => {
                  setEditing(null);
                  setForm({ name: '', percentReturn: 150, durationDays: 4, minInvestment: 10, maxInvestment: 10000, isActive: true });
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Plans List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
          <p className="mt-2 text-gray-400">Loading plans...</p>
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gold">Existing Plans ({plans.length})</h2>
          
          {isMobile ? (
            // Mobile Card Layout
            <div className="space-y-4">
              {plans.map(plan => (
                <PlanCard key={plan._id} plan={plan} />
              ))}
            </div>
          ) : (
            // Desktop Table Layout
            <div className="overflow-x-auto rounded-lg border border-gray-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700 bg-gray-900 text-left">
                    <th className="py-3 px-4 font-semibold">Name</th>
                    <th className="py-3 px-4 font-semibold">% Return</th>
                    <th className="py-3 px-4 font-semibold">Days</th>
                    <th className="py-3 px-4 font-semibold">Min</th>
                    <th className="py-3 px-4 font-semibold">Max</th>
                    <th className="py-3 px-4 font-semibold">Active</th>
                    <th className="py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map(plan => (
                    <tr key={plan._id} className="border-b border-gray-800 hover:bg-gray-800 transition">
                      <td className="py-3 px-4 font-medium">{plan.name}</td>
                      <td className="py-3 px-4">{plan.percentReturn}%</td>
                      <td className="py-3 px-4">{plan.durationDays}</td>
                      <td className="py-3 px-4">${plan.minInvestment}</td>
                      <td className="py-3 px-4">${plan.maxInvestment}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${plan.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                          {plan.isActive ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button 
                            className="text-blue-600 font-semibold hover:underline px-2 py-1 rounded hover:bg-blue-600 hover:text-white transition" 
                            onClick={() => handleEdit(plan)}
                          >
                            Edit
                          </button>
                          <button 
                            className="text-red-600 font-semibold hover:underline px-2 py-1 rounded hover:bg-red-600 hover:text-white transition" 
                            onClick={() => handleDelete(plan._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {plans.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p>No investment plans found.</p>
              <p className="text-sm mt-1">Create your first plan using the form above.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlansAdmin;
