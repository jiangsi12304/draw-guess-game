interface GlowButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const variantStyles = {
  primary: 'bg-gradient-to-r from-warm-pink to-warm-orange text-white',
  secondary: 'bg-gradient-to-r from-warm-purple to-warm-blue text-white',
  danger: 'bg-red-400 text-white hover:bg-red-500',
};

export default function GlowButton({
  children,
  onClick,
  className = '',
  variant = 'primary',
  disabled = false,
  type = 'button',
}: GlowButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`glow-btn relative pointer-events-auto ${variantStyles[variant]} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      {children}
    </button>
  );
}
