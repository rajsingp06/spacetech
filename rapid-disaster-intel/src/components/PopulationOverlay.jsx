import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PopulationOverlay = ({ visible, onToggle }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        className="absolute top-8 right-8 w-72 bg-white rounded-xl shadow-2xl z-40 overflow-hidden"
      >
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h4 className="font-bold text-gray-800 text-sm">Overlays</h4>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Population Density</p>
                <p className="text-xs text-gray-500">WorldPop Raster 2024</p>
              </div>
            </div>
            
            <button 
              onClick={() => onToggle(!visible)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${visible ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${visible ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <AnimatePresence>
            {visible && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="pt-3 overflow-hidden"
              >
                <div className="text-xs text-gray-600 mb-2">Density (people per km²)</div>
                <div className="h-3 w-full rounded-full bg-gradient-to-r from-blue-200 via-yellow-400 to-red-600"></div>
                <div className="flex justify-between mt-1 text-xs text-gray-500 font-medium">
                  <span>0</span>
                  <span>1k</span>
                  <span>10k+</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PopulationOverlay;
