import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ActionPanel = ({ score = 8.2 }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [urgency, setUrgency] = useState(score);
  const [notes, setNotes] = useState('');
  const [selectedResources, setSelectedResources] = useState(['Medical']);

  const resources = ['Medical', 'Search & Rescue', 'Supplies', 'Engineers', 'Evacuation'];

  const toggleResource = (res) => {
    if (selectedResources.includes(res)) {
      setSelectedResources(selectedResources.filter(r => r !== res));
    } else {
      setSelectedResources([...selectedResources, res]);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-2xl bg-white rounded-t-2xl shadow-2xl z-40 overflow-hidden"
        >
          <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
            <h3 className="text-lg font-bold flex items-center">
              <span className="bg-red-500 w-3 h-3 rounded-full mr-2 animate-pulse"></span>
              Deploy Resources to Zone
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Urgency Slider */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Urgency Level: {urgency.toFixed(1)} / 10</label>
              <input 
                type="range" 
                min="1" 
                max="10" 
                step="0.1" 
                value={urgency} 
                onChange={(e) => setUrgency(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
            </div>

            {/* Resources Needed */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Required Resources</label>
              <div className="flex flex-wrap gap-2">
                {resources.map(res => (
                  <button
                    key={res}
                    onClick={() => toggleResource(res)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedResources.includes(res)
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Field Notes</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add critical information for the field teams..."
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                rows="3"
              ></textarea>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-2">
              <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold shadow-lg transition-colors">
                Send Deployment Order
              </button>
              <button className="flex-1 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-800 py-3 rounded-xl font-bold transition-colors">
                Generate PDF Report
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ActionPanel;
