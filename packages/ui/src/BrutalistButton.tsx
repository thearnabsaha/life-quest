import React from 'react';

interface BrutalistButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
}

const VARIANTS = {
  primary: 'bg-[#39ff14] text-black hover:bg-[#2dd610] shadow-[4px_4px_0px_0px_#fff]',
  secondary: 'bg-zinc-800 text-white hover:bg-zinc-700 shadow-[4px_4px_0px_0px_#39ff14]',
  danger: 'bg-[#ff2d95] text-black hover:bg-[#e0257f] shadow-[4px_4px_0px_0px_#fff]',
};

export function BrutalistButton({
  variant = 'primary',
  children,
  className = '',
  ...props
}: BrutalistButtonProps) {
  return (
    <button
      className={`border-[2px] border-white px-6 py-3 font-bold uppercase tracking-wider transition-all duration-150 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
