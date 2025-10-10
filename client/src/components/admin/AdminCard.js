import React from 'react';

const AdminCard = ({ title, value, icon, change }) => (
  <div className="bg-gray-900 bg-opacity-80 backdrop-blur-sm border border-gray-800 p-4 md:p-6 rounded-xl flex flex-col items-start shadow-lg hover:shadow-xl transition-all duration-300 hover:border-gray-700 group">
    <div className="flex items-center justify-between w-full mb-3">
      <div className="text-2xl md:text-3xl text-gold group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      {change && (
        <div className="text-xs md:text-sm px-2 py-1 bg-green-500 bg-opacity-20 text-green-400 rounded-full border border-green-500 border-opacity-30">
          {change}
        </div>
      )}
    </div>
    
    <div className="w-full">
      <div className="text-sm md:text-base font-medium text-gray-300 mb-1 leading-tight">
        {title}
      </div>
      <div className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight break-all">
        {value}
      </div>
    </div>
  </div>
);

export default AdminCard;
