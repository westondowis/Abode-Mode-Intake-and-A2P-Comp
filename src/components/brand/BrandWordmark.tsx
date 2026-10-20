import React from 'react';
import brokerImg from '../../assets/images/abode_broker_1790971379949.jpg';
import sealImg from '../../assets/images/abode_seal_1790971391292.jpg';

interface BrandWordmarkProps {
  variant?: 'panel' | 'horizontal' | 'stacked' | 'seal' | 'compact';
  className?: string;
  brokerWidth?: number;
}

export const BrandWordmark: React.FC<BrandWordmarkProps> = ({
  variant = 'panel',
  className = '',
  brokerWidth = 56,
}) => {
  if (variant === 'seal') {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-full bg-white border-2 border-[#0A4251] p-1 shadow-md overflow-hidden ${className}`}
        style={{ width: 76, height: 76 }}
      >
        <img
          src={sealImg}
          alt="Abode Mode Official Seal"
          className="w-full h-full object-cover rounded-full"
          loading="lazy"
        />
        <div className="absolute inset-0 rounded-full border border-[#F2C864]/40 pointer-events-none" />
      </div>
    );
  }

  // The Wordmark Panel strictly conforming to brand guidelines
  const WordmarkBox = ({ compact = false }: { compact?: boolean }) => (
    <div
      className={`relative border border-[#F2C864] bg-[#0A4251] ${
        compact ? 'px-3 py-1.5' : 'px-5 py-3'
      } text-center min-w-[200px] select-none shadow-sm`}
    >
      {/* Micro Top Line */}
      <div
        className={`${
          compact ? 'text-[8px]' : 'text-[9px]'
        } tracking-[0.28em] text-[#88BBD8] font-medium uppercase leading-tight mb-1 font-mono`}
      >
        ABODE · A · LA · MODE
      </div>
      {/* Primary Brand Name */}
      <div
        className={`${
          compact ? 'text-lg' : 'text-xl md:text-2xl'
        } font-serif tracking-[0.24em] text-[#F2C864] font-semibold uppercase leading-snug`}
      >
        ABODE — MODE
      </div>
      {/* Tagline */}
      <div
        className={`${
          compact ? 'text-[7.5px]' : 'text-[8.5px] md:text-[9.5px]'
        } tracking-[0.26em] text-[#88BBD8] font-medium uppercase mt-1`}
      >
        FASHIONABLY EASY HOME SALES
      </div>
    </div>
  );

  if (variant === 'horizontal') {
    return (
      <div
        className={`inline-flex items-center gap-4 bg-[#0A4251] p-2.5 rounded border border-[#F2C864]/30 ${className}`}
      >
        <div
          className="relative overflow-hidden rounded border border-[#F2C864]/50 bg-[#00171C] shrink-0 shadow-sm"
          style={{ width: brokerWidth, height: brokerWidth }}
        >
          <img
            src={brokerImg}
            alt="The Broker - Abode Mode"
            className="w-full h-full object-cover"
          />
        </div>
        <WordmarkBox />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-3 ${className}`}>
        <div
          className="w-10 h-10 rounded overflow-hidden border border-[#F2C864]/60 bg-[#00171C] shrink-0 shadow-xs"
        >
          <img
            src={brokerImg}
            alt="The Broker"
            className="w-full h-full object-cover"
          />
        </div>
        <WordmarkBox compact />
      </div>
    );
  }

  if (variant === 'stacked') {
    return (
      <div
        className={`flex flex-col items-center gap-3 bg-[#0A4251] p-5 rounded border border-[#F2C864]/30 ${className}`}
      >
        <div
          className="relative overflow-hidden rounded border-2 border-[#F2C864] bg-[#00171C] shrink-0 shadow-md"
          style={{ width: brokerWidth * 1.4, height: brokerWidth * 1.4 }}
        >
          <img
            src={brokerImg}
            alt="The Broker - Abode Mode"
            className="w-full h-full object-cover"
          />
        </div>
        <WordmarkBox />
      </div>
    );
  }

  // Default clean panel
  return (
    <div className={`inline-block ${className}`}>
      <WordmarkBox />
    </div>
  );
};
