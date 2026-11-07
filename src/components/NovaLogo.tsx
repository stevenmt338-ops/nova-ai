import React from 'react';

interface NovaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const NovaLogo: React.FC<NovaLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Orbital Star Icon */}
      <div className={`relative ${iconSizes[size]} flex items-center justify-center shrink-0`}>
        {/* Soft Background Glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#7652D6] to-[#5635B5] shadow-[0_4px_14px_rgba(118,82,214,0.35)] opacity-95 transition-transform duration-300 hover:scale-105" />
        
        {/* Vector SVG */}
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative w-3/5 h-3/5 text-white"
        >
          {/* Orbital Ring */}
          <ellipse
            cx="16"
            cy="16"
            rx="12"
            ry="4.5"
            transform="rotate(-28 16 16)"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeDasharray="2 2"
            className="opacity-70"
          />
          {/* 4-Point Nova Star Core */}
          <path
            d="M16 3C16 10 10 16 3 16C10 16 16 22 16 29C16 22 22 16 29 16C22 16 16 10 16 3Z"
            fill="white"
          />
          {/* Central Bright Spark */}
          <circle cx="16" cy="16" r="2.2" fill="#EEE8FF" />
        </svg>
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-tight text-[#201B2B] ${textSizes[size]}`}>
              NOVA
            </span>
            <span className="font-extrabold text-[10px] tracking-widest px-1.5 py-0.5 rounded-md bg-[#EEE8FF] text-[#5635B5] border border-[#7652D6]/20">
              AI
            </span>
          </div>
          {size !== 'sm' && (
            <span className="text-[10px] text-[#777181] font-medium tracking-normal mt-0.5">
              ذكاء واحد. إمكانيات بلا حدود.
            </span>
          )}
        </div>
      )}
    </div>
  );
};
