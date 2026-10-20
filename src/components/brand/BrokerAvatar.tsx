import React from 'react';
import brokerImg from '../../assets/images/abode_broker_1790971379949.jpg';

interface BrokerAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'circle' | 'rounded' | 'square' | 'mark-only';
  className?: string;
  alt?: string;
}

export const BrokerAvatar: React.FC<BrokerAvatarProps> = ({
  size = 'md',
  variant = 'circle',
  className = '',
  alt = 'The Broker - Abode Mode',
}) => {
  // Dimensions per guidelines: minimum 48px, social icon minimum 32px
  const sizeMap = {
    sm: 'w-10 h-10',      // 40px
    md: 'w-13 h-13',      // 52px (meets 48px minimum)
    lg: 'w-20 h-20',      // 80px
    xl: 'w-32 h-32',      // 128px
  };

  const containerClasses =
    variant === 'circle'
      ? 'rounded-full border border-[#F2C864]/60 bg-[#0A4251] overflow-hidden shadow-lg'
      : variant === 'rounded'
      ? 'rounded-2xl border border-[#F2C864]/60 bg-[#0A4251] overflow-hidden shadow-lg'
      : variant === 'square'
      ? 'rounded-none border border-[#F2C864]/60 bg-[#0A4251] overflow-hidden shadow-lg'
      : 'bg-transparent overflow-hidden';

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${sizeMap[size]} ${containerClasses} ${className}`}
    >
      <img
        src={brokerImg}
        alt={alt}
        className="w-full h-full object-cover object-top scale-105"
      />
    </div>
  );
};
