import { forwardRef } from 'react';

/**
 * Modern Card Component
 * Supports multiple variants and hover effects
 */
const Card = forwardRef(({
  children,
  variant = 'default',
  hover = false,
  clickable = false,
  padding = 'md',
  className = '',
  ...props
}, ref) => {
  
  // Base styles
  const baseStyles = `
    rounded-2xl
    transition-all duration-200 ease-out
  `;
  
  // Variant styles
  const variantStyles = {
    default: `
      bg-white
      border border-zinc-200
      shadow-sm
    `,
    elevated: `
      bg-white
      shadow-lg
      border-0
    `,
    glass: `
      bg-white/80 backdrop-blur-xl
      border border-white/20
      shadow-lg
    `,
    gradient: `
      bg-gradient-to-br from-sky-50 to-violet-50
      border border-sky-100
      shadow-sm
    `,
    dark: `
      bg-zinc-900
      border border-zinc-800
      shadow-lg
    `,
    outline: `
      bg-transparent
      border-2 border-zinc-200
    `,
    ghost: `
      bg-zinc-50
      border-0
    `,
  };
  
  // Padding variants
  const paddingStyles = {
    none: '',
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };
  
  // Hover effects
  const hoverStyles = hover ? `
    hover:shadow-xl
    hover:scale-[1.02]
    hover:border-zinc-300
  ` : '';
  
  // Clickable styles
  const clickableStyles = clickable ? `
    cursor-pointer
    active:scale-[0.98]
  ` : '';
  
  return (
    <div
      ref={ref}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${hoverStyles}
        ${clickableStyles}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

// Card Header Component
export const CardHeader = ({ children, className = '', ...props }) => (
  <div 
    className={`flex items-center justify-between mb-4 ${className}`}
    {...props}
  >
    {children}
  </div>
);

// Card Title Component
export const CardTitle = ({ children, className = '', ...props }) => (
  <h3 
    className={`text-lg font-semibold text-zinc-900 ${className}`}
    {...props}
  >
    {children}
  </h3>
);

// Card Description Component
export const CardDescription = ({ children, className = '', ...props }) => (
  <p 
    className={`text-sm text-zinc-500 ${className}`}
    {...props}
  >
    {children}
  </p>
);

// Card Content Component
export const CardContent = ({ children, className = '', ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

// Card Footer Component
export const CardFooter = ({ children, className = '', ...props }) => (
  <div 
    className={`flex items-center justify-end gap-3 mt-4 pt-4 border-t border-zinc-100 ${className}`}
    {...props}
  >
    {children}
  </div>
);

export default Card;
