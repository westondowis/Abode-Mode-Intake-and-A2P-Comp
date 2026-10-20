import React from 'react';
import brokerImg from '../../assets/images/abode_broker_1790971379949.jpg';

interface AbodeSealProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AbodeSeal: React.FC<AbodeSealProps> = ({ size = 'md', className = '' }) => {
  // Seal minimum is 72px per guidelines
  const sizeMap = {
    sm: 'w-20 h-20', // 80px
    md: 'w-28 h-28', // 112px
    lg: 'w-36 h-36', // 144px
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full select-none ${sizeMap[size]} ${className}`}
      title="ABODE-MODE LLC - Official Land Acquisition Seal"
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-xl"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Top curve for ABODE-MODE LLC */}
          <path
            id="topSealArc"
            d="M 28,100 A 72,72 0 0,1 172,100"
            fill="none"
          />
          {/* Bottom curve for FASHIONABLY EASY LAND SALES */}
          <path
            id="bottomSealArc"
            d="M 172,100 A 72,72 0 0,1 28,100"
            fill="none"
          />
          <clipPath id="brokerCircleClip">
            <circle cx="100" cy="100" r="50" />
          </clipPath>
        </defs>

        {/* Outer and Inner Gold Bands */}
        <circle cx="100" cy="100" r="96" fill="#0A4251" stroke="#F2C864" strokeWidth="3" />
        <circle cx="100" cy="100" r="91" fill="none" stroke="#F2C864" strokeWidth="1" strokeDasharray="2 2" />
        <circle cx="100" cy="100" r="55" fill="#00171C" stroke="#F2C864" strokeWidth="2" />

        {/* Top Text: ABODE-MODE LLC */}
        <text
          fill="#F2C864"
          fontSize="12"
          fontWeight="bold"
          fontFamily="Georgia, 'Times New Roman', serif"
          letterSpacing="3"
        >
          <textPath href="#topSealArc" startOffset="50%" textAnchor="middle">
            ABODE-MODE LLC
          </textPath>
        </text>

        {/* Bottom Text: FASHIONABLY EASY LAND SALES */}
        <text
          fill="#88BBD8"
          fontSize="9.5"
          fontWeight="bold"
          fontFamily="'Plus Jakarta Sans', sans-serif"
          letterSpacing="1.8"
        >
          <textPath href="#bottomSealArc" startOffset="50%" textAnchor="middle">
            FASHIONABLY EASY LAND SALES
          </textPath>
        </text>

        {/* Star Accents */}
        <circle cx="24" cy="100" r="2.5" fill="#F2C864" />
        <circle cx="176" cy="100" r="2.5" fill="#F2C864" />

        {/* Broker Character Image in Center */}
        <image
          href={brokerImg}
          x="50"
          y="50"
          width="100"
          height="100"
          clipPath="url(#brokerCircleClip)"
          preserveAspectRatio="xMidYMin slice"
        />

        {/* Inner Gold Rim over photo */}
        <circle cx="100" cy="100" r="50" fill="none" stroke="#F2C864" strokeWidth="1.5" />
      </svg>
    </div>
  );
};
