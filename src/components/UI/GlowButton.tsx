interface GlowButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variantStyles = {
  primary: 'bg-gradient-to-r from-warm-pink to-warm-orange text-white hover:from-warm-pink/90 hover:to-warm-orange/90',
  secondary: 'bg-gradient-to-r from-warm-purple to-warm-blue text-white hover:from-warm-purple/90 hover:to-warm-blue/90',
  danger: 'bg-gradient-to-r from-red-400 to-red-500 text-white hover:from-red-500 hover:to-red-600',
};

const sizeStyles = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export default function GlowButton({
  children,
  onClick,
  className = '',
  variant = 'primary',
  disabled = false,
  type = 'button',
  size = 'md',
  loading = false,
}: GlowButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`glow-btn relative pointer-events-auto ${variantStyles[variant]} ${sizeStyles[size]} ${
        isDisabled
          ? 'opacity-50 cursor-not-allowed grayscale'
          : 'active:scale-95 active:shadow-inner'
      } ${className}`}
      style={{
        transition: 'all 350ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-5 w-5 inline-block"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
