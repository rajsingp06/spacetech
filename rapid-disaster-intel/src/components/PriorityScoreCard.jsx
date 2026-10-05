import React from 'react';
import { motion } from 'framer-motion';

const PriorityScoreCard = ({ score = 8.2, population = 3240, area = 4.8, recommendation = "CRITICAL - Send all resources immediately" }) => {
  
  // Determine color based on score (1-10)
  const getScoreColor = (s) => {
    if (s >= 8) return 'bg-red-600';
    if (s >= 5) return 'bg-orange-500';
    if (s >= 3) return 'bg-yellow-500';
    return 'bg-teal-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="absolute top-8 left-8 w-80 bg-white rounded-xl shadow-2xl z-40 overflow-hidden border border-gray-100"
    >
      {/* Header / Score */}
      <div className={`${getScoreColor(score)} text-white p-6 flex flex-col items-center justify-center relative overflow-hidden`}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 10%, transparent 10%)', backgroundSize: '10px 10px' }}></div>
        
        <span className="text-sm font-bold tracking-wider uppercase mb-1 z-10">Priority Score</span>
        <div className="text-6xl font-black tracking-tighter drop-shadow-md z-10">
          {score.toFixed(1)}
        </div>
      </div>

      {/* Details */}
      <div className="p-5">
        <p className="text-sm font-bold text-red-600 mb-4 pb-4 border-b border-gray-100">
          {recommendation}
        </p>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              Affected People
            </span>
            <span className="font-bold text-gray-800">{population.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
              Zone Area
            </span>
            <span className="font-bold text-gray-800">{area} km²</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Building Damage
            </span>
            <span className="font-bold text-red-600">Severe (85%)</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PriorityScoreCard;
