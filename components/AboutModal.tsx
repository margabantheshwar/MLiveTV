
import React from 'react';
import { X, Tv } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, content }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#15181a] w-full max-w-lg rounded-2xl border border-gray-800 shadow-2xl overflow-hidden transform transition-all scale-100">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#1a1d21]">
          <div className="flex items-center gap-3">
             <div className="bg-[#00d1ff]/10 p-2 rounded-lg">
                <Tv className="w-6 h-6 text-[#00d1ff]" />
             </div>
             <h2 className="text-xl font-bold text-white">About MLiveTV</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        {/* Dynamic Content */}
        <div className="p-6 text-gray-300 overflow-y-auto max-h-[60vh] custom-scrollbar">
           <div className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
             {content || "No content available."}
           </div>
           
           <p className="text-sm italic opacity-70 border-t border-gray-800 pt-4 mt-6">
            Version 4.2.0 &bull; Built with React & Tailwind
           </p>
        </div>

        <div className="p-4 bg-[#0f1113] flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
