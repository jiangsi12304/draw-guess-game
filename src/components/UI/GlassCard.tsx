import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hoverEffect?: boolean;
  glowOnHover?: boolean;
}

export default function GlassCard({
  children,
  className = '',
  style,
  hoverEffect = true,
  glowOnHover = true
}: GlassCardProps) {
  const hoverClasses = hoverEffect
    ? 'hover:-translate-y-1 hover:shadow-2xl'
    : '';

  const glowClasses = glowOnHover
    ? 'hover:shadow-[0_0_30px_rgba(255,182,193,0.4),0_0_60px_rgba(255,204,128,0.2)]'
    : '';

  return (
    <div
      className={`glossy-card p-6 fade-in-up ${hoverClasses} ${glowClasses} ${className}`}
      style={{ pointerEvents: 'auto', ...style }}
    >
      {children}
    </div>
  );
}
