import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Modern Button Component
 * Inspired by Linear, Vercel, and Stripe design systems
 */
const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  ...props
}, ref) => {
  
  // Base styles
  const baseStyles = `
    inline-flex items-center justify-center
    font-semibold
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-[0.98]
  `;
  
  // Size variants
  const sizeStyles = {
    xs: 'px-2.5 py-1.5 text-xs rounded-lg gap-1.5',
    sm: 'px-3 py-2 text-sm rounded-lg gap-2',
    md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
    lg: 'px-5 py-3 text-base rounded-xl gap-2.5',
    xl: 'px-6 py-3.5 text-lg rounded-2xl gap-3',
  };
  
  // Variant styles
  const variantStyles = {
    primary: `
      bg-gradient-to-r from-sky-500 to-violet-500
      hover:from-sky-600 hover:to-violet-600
      text-white
      shadow-lg shadow-sky-500/25
      hover:shadow-xl hover:shadow-sky-500/30
      focus:ring-sky-500
    `,
    secondary: `
      bg-zinc-100 hover:bg-zinc-200
      text-zinc-900
      shadow-sm
      focus:ring-zinc-500
    `,
    outline: `
      bg-transparent
      border-2 border-zinc-200 hover:border-zinc-300
      text-zinc-700 hover:text-zinc-900
      hover:bg-zinc-50
      focus:ring-zinc-500
    `,
    ghost: `
      bg-transparent hover:bg-zinc-100
      text-zinc-600 hover:text-zinc-900
      focus:ring-zinc-500
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-rose-500
      hover:from-red-600 hover:to-rose-600
      text-white
      shadow-lg shadow-red-500/25
      hover:shadow-xl hover:shadow-red-500/30
      focus:ring-red-500
    `,
    success: `
      bg-gradient-to-r from-emerald-500 to-teal-500
      hover:from-emerald-600 hover:to-teal-600
      text-white
      shadow-lg shadow-emerald-500/25
      hover:shadow-xl hover:shadow-emerald-500/30
      focus:ring-emerald-500
    `,
    glass: `
      bg-white/10 backdrop-blur-md
      border border-white/20
      text-white
      hover:bg-white/20
      focus:ring-white/50
    `,
  };
  
  // Icon sizes
  const iconSizes = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  };
  
  const isDisabled = disabled || loading;
  
  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className={`${iconSizes[size]} animate-spin`} />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && (
            <Icon className={iconSizes[size]} strokeWidth={2.5} />
          )}
          {children}
          {Icon && iconPosition === 'right' && (
            <Icon className={iconSizes[size]} strokeWidth={2.5} />
          )}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
