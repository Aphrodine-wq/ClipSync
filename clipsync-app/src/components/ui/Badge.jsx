import { forwardRef } from 'react';

/**
 * Modern Badge Component
 * For status indicators, tags, and labels
 */
const Badge = forwardRef(({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  icon: Icon,
  className = '',
  ...props
}, ref) => {
  
  // Base styles
  const baseStyles = `
    inline-flex items-center
    font-semibold
    transition-all duration-150
  `;
  
  // Size variants
  const sizeStyles = {
    xs: 'px-1.5 py-0.5 text-[10px] rounded gap-1',
    sm: 'px-2 py-0.5 text-xs rounded-md gap-1',
    md: 'px-2.5 py-1 text-xs rounded-lg gap-1.5',
    lg: 'px-3 py-1.5 text-sm rounded-lg gap-2',
  };
  
  // Variant styles
  const variantStyles = {
    default: 'bg-zinc-100 text-zinc-700',
    primary: 'bg-sky-100 text-sky-700',
    secondary: 'bg-violet-100 text-violet-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    
    // Gradient variants
    gradientPrimary: 'bg-gradient-to-r from-sky-500 to-violet-500 text-white',
    gradientSuccess: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
    gradientDanger: 'bg-gradient-to-r from-red-500 to-rose-500 text-white',
    
    // Outline variants
    outlinePrimary: 'bg-transparent border border-sky-300 text-sky-700',
    outlineSuccess: 'bg-transparent border border-emerald-300 text-emerald-700',
    outlineDanger: 'bg-transparent border border-red-300 text-red-700',
    
    // Dark variants
    dark: 'bg-zinc-900 text-white',
    darkPrimary: 'bg-sky-900 text-sky-100',
    darkSuccess: 'bg-emerald-900 text-emerald-100',
    darkDanger: 'bg-red-900 text-red-100',
  };
  
  // Icon sizes
  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };
  
  // Dot sizes
  const dotSizes = {
    xs: 'w-1 h-1',
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };
  
  // Dot colors based on variant
  const dotColors = {
    default: 'bg-zinc-500',
    primary: 'bg-sky-500',
    secondary: 'bg-violet-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
    gradientPrimary: 'bg-white',
    gradientSuccess: 'bg-white',
    gradientDanger: 'bg-white',
    outlinePrimary: 'bg-sky-500',
    outlineSuccess: 'bg-emerald-500',
    outlineDanger: 'bg-red-500',
    dark: 'bg-white',
    darkPrimary: 'bg-sky-400',
    darkSuccess: 'bg-emerald-400',
    darkDanger: 'bg-red-400',
  };
  
  return (
    <span
      ref={ref}
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      {dot && (
        <span className={`${dotSizes[size]} ${dotColors[variant]} rounded-full animate-pulse`} />
      )}
      {Icon && <Icon className={iconSizes[size]} strokeWidth={2.5} />}
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';

export default Badge;
