import React from 'react';

interface AbodeWordmarkProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showSublines?: boolean;
  tagline?: string;
}

export const AbodeWordmark: React.FC<AbodeWordmarkProps> = ({
  size = 'md',
  className = '',
  showSublines = true,
  tagline = 'FASHIONABLY EASY LAND SALES',
}) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  return (
    <div
      className={`relative inline-block border border-[#F2C864]/90 rounded-sm bg-[#0A4251] select-none text-center shadow-lg ${
        isSm ? 'px-3 py-1.5 min-w-[150px]' : isLg ? 'px-8 py-5 min-w-[320px]' : 'px-5 py-2.5 min-w-[210px]'
      } ${className}`}
    >
      {/* Top micro-line "ABODE - A - LA - MODE" */}
      {showSublines && (
        <div
          className={`font-serif tracking-[0.25em] text-[#F2C864] uppercase opacity-95 ${
            isSm ? 'text-[7px]' : isLg ? 'text-[10px]' : 'text-[8px]'
          }`}
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          ABODE - A - LA - MODE
        </div>
      )}

      {/* Main Brand Name "A B O D E  -  M O D E" */}
      <div
        className={`font-serif tracking-[0.3em] font-semibold text-[#F2C864] uppercase leading-tight my-0.5 ${
          isSm ? 'text-xs' : isLg ? 'text-2xl' : 'text-base sm:text-lg'
        }`}
        style={{
          fontFamily: 'Georgia, "Times New Roman", Garamond, serif',
          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
        }}
      >
        ABODE - MODE
      </div>

      {/* Bottom Tagline changed to LAND SALES as requested */}
      {showSublines && (
        <div
          className={`tracking-[0.22em] text-[#88BBD8] uppercase font-semibold ${
            isSm ? 'text-[6px]' : isLg ? 'text-[10px]' : 'text-[7.5px]'
          }`}
        >
          {tagline}
        </div>
      )}
    </div>
  );
};
