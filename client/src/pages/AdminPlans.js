// AdminPlans.js
// Admin page for managing investment plans (add, edit, list)
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = '/api/admin/plans';

export default function AdminPlans() {
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState({ name: '', roi: '', duration: '', min: '', max: '' });
  const [editingId, setEditingId] = useState(null);
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
    fetchPlans();
  }, []);

  async function fetchPlans() {
    const token = localStorage.getItem('adminToken');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const res = await axios.get(API_BASE, config);
    setPlans(res.data);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const payload = {
      name: form.name,
      roi: form.roi,
      duration: form.duration,
      min: form.min,
      max: form.max,
      percentReturn: form.roi,
      durationDays: form.duration,
      minInvestment: form.min,
      maxInvestment: form.max
    };
    if (editingId) {
      await axios.put(`${API_BASE}/${editingId}`, payload, config);
    } else {
      await axios.post(API_BASE, payload, config);
    }
    setForm({ name: '', roi: '', duration: '', min: '', max: '' });
    setEditingId(null);
    fetchPlans();
  }

  function handleEdit(plan) {
    setForm({ name: plan.name, roi: plan.roi, duration: plan.duration, min: plan.min, max: plan.max });
    setEditingId(plan._id);
  }

  async function handleDelete(id) {
    const token = localStorage.getItem('adminToken');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    await axios.delete(`${API_BASE}/${id}`, config);
    fetchPlans();
  }

  const PlanCard = ({ plan, index }) => (
    <div className="bg-gray-900 rounded-lg p-4 mb-3 border border-gray-700">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-base font-semibold text-white">{plan.name}</h3>
        <span className="text-xs text-gray-400">#{index + 1}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div>
          <span className="text-gray-400 block">ROI:</span>
          <div className="font-semibold text-white">{plan.roi}%</div>
        </div>
        <div>
          <span className="text-gray-400 block">Duration:</span>
          <div className="font-semibold text-white">{plan.duration} days</div>
        </div>
        <div>
          <span className="text-gray-400 block">Min Amount:</span>
          <div className="font-semibold text-white">${plan.min}</div>
        </div>
        <div>
          <span className="text-gray-400 block">Max Amount:</span>
          <div className="font-semibold text-white">${plan.max}</div>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button 
          onClick={() => handleEdit(plan)} 
          className="flex-1 bg-blue-600 text-white px-3 py-2 rounded font-medium hover:bg-blue-700 transition text-sm"
        >
          Edit
        </button>
        <button 
          onClick={() => handleDelete(plan._id)} 
          className="flex-1 bg-red-600 text-white px-3 py-2 rounded font-medium hover:bg-red-700 transition text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 font-sans text-base text-gray-900">
      <div className="flex flex-col gap-2 sm:gap-4 mb-4 sm:mb-6 md:flex-row md:items-center md:justify-between">
        <h1 className="text-xl sm:text-2xl font-bold whitespace-nowrap">Plan Management</h1>
        <span className="text-xs sm:text-sm text-gray-400">Total Plans: {plans.length}</span>
      </div>
      <div className="bg-gray-800 rounded-xl p-3 sm:p-4 md:p-6 mb-6 sm:mb-8">
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">
          {editingId ? 'Edit Plan' : 'Create New Plan'}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <input 
            name="name" 
            value={form.name} 
            onChange={handleChange} 
            placeholder="Plan Name" 
            className="border border-gray-600 p-3 sm:p-2 rounded text-base sm:text-sm bg-gray-900 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" 
            required 
          />
          <input 
            name="roi" 
            value={form.roi} 
            onChange={handleChange} 
            placeholder="ROI (%)" 
            type="number"
            className="border border-gray-600 p-3 sm:p-2 rounded text-base sm:text-sm bg-gray-900 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" 
            required 
          />
          <input 
            name="duration" 
            value={form.duration} 
            onChange={handleChange} 
            placeholder="Duration (days)" 
            type="number"
            className="border border-gray-600 p-3 sm:p-2 rounded text-base sm:text-sm bg-gray-900 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" 
            required 
          />
          <input 
            name="min" 
            value={form.min} 
            onChange={handleChange} 
            placeholder="Min ($)" 
            type="number"
            className="border border-gray-600 p-3 sm:p-2 rounded text-base sm:text-sm bg-gray-900 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" 
            required 
          />
          <input 
            name="max" 
            value={form.max} 
            onChange={handleChange} 
            placeholder="Max ($)" 
            type="number"
            className="border border-gray-600 p-3 sm:p-2 rounded text-base sm:text-sm bg-gray-900 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" 
            required 
          />
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 mt-2 sm:mt-0">
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-4 py-3 sm:py-2 rounded font-semibold hover:bg-blue-700 transition text-base sm:text-sm"
            >
              {editingId ? 'Update' : 'Add'} Plan
            </button>
            {editingId && (
              <button 
                type="button" 
                onClick={() => { 
                  setEditingId(null); 
                  setForm({ name: '', roi: '', duration: '', min: '', max: '' }); 
                }} 
                className="px-4 py-3 sm:py-2 border border-gray-600 rounded text-white hover:bg-gray-700 transition text-base sm:text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      <div className="bg-gray-800 rounded-xl p-3 sm:p-4 md:p-6">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">
          Existing Plans ({plans.length})
        </h3>
        
        {plans.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-gray-400">
            <p className="text-sm sm:text-base">No investment plans found.</p>
            <p className="text-xs sm:text-sm mt-1">Create your first plan using the form above.</p>
          </div>
        ) : isMobile ? (
          // Mobile Card Layout
          <div className="space-y-3">
            {plans.map((plan, idx) => (
              <PlanCard key={plan._id} plan={plan} index={idx} />
            ))}
          </div>
        ) : (
          // Desktop Table Layout
          <div className="overflow-x-auto">
            <table className="w-full text-sm sm:text-base text-white">
              <thead>
                <tr className="bg-gray-900">
                  <th className="p-2 sm:p-3 font-bold text-left">Name</th>
                  <th className="p-2 sm:p-3 font-bold text-left">ROI (%)</th>
                  <th className="p-2 sm:p-3 font-bold text-left">Duration</th>
                  <th className="p-2 sm:p-3 font-bold text-left">Min</th>
                  <th className="p-2 sm:p-3 font-bold text-left">Max</th>
                  <th className="p-2 sm:p-3 font-bold text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan, idx) => (
                  <tr key={plan._id} className={idx % 2 === 0 ? 'bg-gray-900' : 'bg-gray-700'}>
                    <td className="p-2 sm:p-3 font-semibold">{plan.name}</td>
                    <td className="p-2 sm:p-3">{plan.roi}%</td>
                    <td className="p-2 sm:p-3">{plan.duration} days</td>
                    <td className="p-2 sm:p-3">${plan.min}</td>
                    <td className="p-2 sm:p-3">${plan.max}</td>
                    <td className="p-2 sm:p-3">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(plan)} 
                          className="text-blue-400 font-semibold hover:underline px-2 py-1 rounded hover:bg-blue-600 hover:text-white transition text-xs sm:text-sm"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(plan._id)} 
                          className="text-red-400 font-semibold hover:underline px-2 py-1 rounded hover:bg-red-600 hover:text-white transition text-xs sm:text-sm"
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
      </div>
    </div>
  );
}
