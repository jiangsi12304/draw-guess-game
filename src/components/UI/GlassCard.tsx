interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function GlassCard({ children, className = '' }: GlassCardProps) {
  return (
    <div className={`glossy-card p-6 ${className}`} style={{ pointerEvents: 'auto' }}>
      {children}
    </div>
  );
}
