import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAppStore from '../store/appStore';

const OverlayTogglePanel = () => {
  const overlays = useAppStore(state => state.overlays);
  const toggleOverlay = useAppStore(state => state.toggleOverlay);

  const overlayOptions = [
    {
      id: 'population',
      label: 'Population Density',
      desc: 'WorldPop Raster 2024',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
      ),
      color: 'bg-blue-100 text-blue-600',
      legend: (
        <div className="pt-3">
          <div className="text-xs text-gray-600 mb-2">Density (people per km²)</div>
          <div className="h-2 w-full rounded-full bg-gradient-to-r from-blue-200 via-yellow-400 to-red-600"></div>
          <div className="flex justify-between mt-1 text-xs text-gray-500 font-medium">
            <span>0</span><span>1k</span><span>10k+</span>
          </div>
        </div>
      )
    },
    {
      id: 'searchZones',
      label: 'Search Zones',
      desc: 'Priority Concentric Rings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      ),
      color: 'bg-purple-100 text-purple-600',
      legend: (
        <div className="pt-3 flex gap-2">
          <div className="flex items-center text-xs"><span className="w-3 h-3 bg-red-500 rounded-full mr-1 opacity-75"></span>High</div>
          <div className="flex items-center text-xs"><span className="w-3 h-3 bg-orange-400 rounded-full mr-1 opacity-75"></span>Med</div>
          <div className="flex items-center text-xs"><span className="w-3 h-3 bg-yellow-300 rounded-full mr-1 opacity-75"></span>Low</div>
        </div>
      )
    },
    {
      id: 'roads',
      label: 'Road Accessibility',
      desc: 'Clearance & Blockages',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
      ),
      color: 'bg-emerald-100 text-emerald-600',
      legend: (
        <div className="pt-3 flex gap-2">
          <div className="flex items-center text-xs"><span className="w-4 h-1 bg-green-500 mr-1"></span>Clear</div>
          <div className="flex items-center text-xs"><span className="w-4 h-1 bg-red-500 mr-1"></span>Blocked</div>
        </div>
      )
    },
    {
      id: 'damage',
      label: 'Building Damage',
      desc: 'Structural Assessment',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
      ),
      color: 'bg-red-100 text-red-600',
      legend: (
        <div className="pt-3 flex gap-2">
          <div className="flex items-center text-xs"><span className="w-3 h-3 bg-red-600 mr-1"></span>Destroyed</div>
          <div className="flex items-center text-xs"><span className="w-3 h-3 bg-orange-400 mr-1"></span>Damaged</div>
        </div>
      )
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="absolute top-8 right-8 w-80 bg-white rounded-xl shadow-2xl z-40 overflow-hidden border border-gray-100"
    >
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h4 className="font-bold text-gray-800 text-sm">Intelligence Overlays</h4>
      </div>
      
      <div className="p-2">
        {overlayOptions.map((opt, i) => {
          const isActive = overlays[opt.id];
          return (
            <div key={opt.id} className="p-3 border-b border-gray-50 last:border-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${opt.color}`}>
                    {opt.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{opt.label}</p>
                    <p className="text-xs text-gray-400">{opt.desc}</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => toggleOverlay(opt.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <AnimatePresence>
                {isActive && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    {opt.legend}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default OverlayTogglePanel;
