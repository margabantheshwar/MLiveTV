
import React, { useEffect, useRef, useState } from 'react';
import { ADSENSE_CLIENT_ID } from '../constants';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdBannerProps {
  dataAdSlot?: string;
  dataAdFormat?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  dataFullWidthResponsive?: boolean;
  className?: string;
  label?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({
  dataAdSlot = "1234567890", // Replace with your actual Ad Slot ID from AdSense dashboard
  dataAdFormat = "auto",
  dataFullWidthResponsive = true,
  className = "",
  label = "Advertisement"
}) => {
  const adRef = useRef<HTMLModElement>(null);
  const [adError, setAdError] = useState(false);

  useEffect(() => {
    try {
      // Check if window.adsbygoogle exists (script loaded)
      // And check if the ad element is empty to prevent double-pushing in React strict mode
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        if (adRef.current && adRef.current.innerHTML === "") {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      }
    } catch (e) {
      console.error("AdSense failed to load", e);
      setAdError(true);
    }
  }, []);

  if (adError) return null;

  return (
    <div className={`ad-container relative w-full flex flex-col items-center justify-center my-6 bg-[#15181a] border border-gray-800/50 rounded-lg overflow-hidden min-h-[100px] ${className}`}>
        <div className="absolute top-0 right-0 bg-gray-800/80 px-2 py-0.5 rounded-bl text-[9px] text-gray-400 font-mono tracking-wider z-10 pointer-events-none">
          {label}
        </div>
        
        {/* AdSense Unit */}
        <div className="w-full flex justify-center overflow-hidden">
          <ins className="adsbygoogle"
               style={{ display: 'block', width: '100%', textAlign: 'center' }}
               data-ad-client={ADSENSE_CLIENT_ID}
               data-ad-slot={dataAdSlot}
               data-ad-format={dataAdFormat}
               data-full-width-responsive={dataFullWidthResponsive ? "true" : "false"}
               ref={adRef}>
          </ins>
        </div>
        
        {/* Placeholder for development/preview when ads aren't loading */}
        <div className="absolute inset-0 flex flex-col items-center justify-center -z-0 opacity-10 pointer-events-none">
            <span className="text-4xl font-black text-gray-500">AD SPACE</span>
            <span className="text-xs text-gray-500 mt-2">{ADSENSE_CLIENT_ID}</span>
        </div>
    </div>
  );
};

export default AdBanner;