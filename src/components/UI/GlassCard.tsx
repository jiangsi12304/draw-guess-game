import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function GlassCard({ children, className = '', style }: GlassCardProps) {
  return (
    <div className={`glossy-card p-6 ${className}`} style={{ pointerEvents: 'auto', ...style }}>
      {children}
    </div>
  );
}
