import React from 'react';

interface BrutalistCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export function BrutalistCard({
  children,
  className = '',
  glowColor = '#39ff14',
}: BrutalistCardProps) {
  return (
    <div
      className={`border-[3px] border-white bg-zinc-900 p-6 transition-shadow duration-200 ${className}`}
      style={{
        boxShadow: `6px 6px 0px 0px ${glowColor}`,
      }}
    >
      {children}
    </div>
  );
}
