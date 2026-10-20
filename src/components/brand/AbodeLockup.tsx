import React from 'react';
import { BrokerAvatar } from './BrokerAvatar';
import { AbodeWordmark } from './AbodeWordmark';

interface AbodeLockupProps {
  layout?: 'horizontal' | 'stacked';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export const AbodeLockup: React.FC<AbodeLockupProps> = ({
  layout = 'horizontal',
  size = 'md',
  className = '',
  onClick,
}) => {
  if (layout === 'horizontal') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center gap-3 sm:gap-3.5 select-none transition-all ${
          onClick ? 'cursor-pointer group hover:opacity-95' : ''
        } ${className}`}
      >
        {/* The Broker at Left */}
        <BrokerAvatar
          size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
          variant="rounded"
          className="shadow-md ring-1 ring-[#F2C864]/40"
        />

        {/* Wordmark Panel at Right */}
        <AbodeWordmark size={size} />
      </div>
    );
  }

  // Stacked Lockup: Broker centered above wordmark panel
  return (
    <div
      onClick={onClick}
      className={`inline-flex flex-col items-center text-center gap-3 select-none transition-all ${
        onClick ? 'cursor-pointer group hover:opacity-95' : ''
      } ${className}`}
    >
      {/* The Broker centered */}
      <BrokerAvatar
        size={size === 'sm' ? 'md' : size === 'lg' ? 'xl' : 'lg'}
        variant="circle"
        className="shadow-2xl ring-2 ring-[#F2C864]/70"
      />

      {/* Wordmark Panel centered */}
      <AbodeWordmark size={size} />
    </div>
  );
};
