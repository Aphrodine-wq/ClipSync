import { forwardRef, useState } from 'react';
import { Eye, EyeOff, Search, X } from 'lucide-react';

/**
 * Modern Input Component
 * Supports various types, icons, and states
 */
const Input = forwardRef(({
  type = 'text',
  variant = 'default',
  size = 'md',
  label,
  error,
  hint,
  icon: Icon,
  iconPosition = 'left',
  clearable = false,
  onClear,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;
  
  // Size variants
  const sizeStyles = {
    sm: {
      input: 'px-3 py-2 text-sm',
      icon: 'w-4 h-4',
      iconPadding: Icon ? (iconPosition === 'left' ? 'pl-9' : 'pr-9') : '',
    },
    md: {
      input: 'px-4 py-2.5 text-sm',
      icon: 'w-4 h-4',
      iconPadding: Icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : '',
    },
    lg: {
      input: 'px-4 py-3 text-base',
      icon: 'w-5 h-5',
      iconPadding: Icon ? (iconPosition === 'left' ? 'pl-11' : 'pr-11') : '',
    },
  };
  
  // Variant styles
  const variantStyles = {
    default: `
      bg-white
      border border-zinc-200
      focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20
      ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
    `,
    filled: `
      bg-zinc-100
      border-2 border-transparent
      focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20
      ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
    `,
    ghost: `
      bg-transparent
      border-b-2 border-zinc-200
      rounded-none
      focus:border-sky-500
      ${error ? 'border-red-500 focus:border-red-500' : ''}
    `,
    glass: `
      bg-white/10 backdrop-blur-md
      border border-white/20
      text-white placeholder:text-white/50
      focus:border-white/40 focus:ring-2 focus:ring-white/20
    `,
  };
  
  // Icon position styles
  const iconPositionStyles = {
    left: 'left-3',
    right: 'right-3',
  };
  
  return (
    <div className={`w-full ${containerClassName}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
          {label}
        </label>
      )}
      
      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {Icon && iconPosition === 'left' && (
          <div className={`absolute ${iconPositionStyles.left} top-1/2 -translate-y-1/2 pointer-events-none`}>
            <Icon 
              className={`${sizeStyles[size].icon} ${isFocused ? 'text-sky-500' : 'text-zinc-400'} transition-colors`} 
              strokeWidth={2} 
            />
          </div>
        )}
        
        {/* Input */}
        <input
          ref={ref}
          type={inputType}
          className={`
            w-full
            rounded-xl
            transition-all duration-200
            placeholder:text-zinc-400
            disabled:opacity-50 disabled:cursor-not-allowed
            ${sizeStyles[size].input}
            ${sizeStyles[size].iconPadding}
            ${variantStyles[variant]}
            ${isPassword || clearable ? 'pr-10' : ''}
            ${className}
          `}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        
        {/* Right Icon */}
        {Icon && iconPosition === 'right' && !isPassword && !clearable && (
          <div className={`absolute ${iconPositionStyles.right} top-1/2 -translate-y-1/2 pointer-events-none`}>
            <Icon 
              className={`${sizeStyles[size].icon} ${isFocused ? 'text-sky-500' : 'text-zinc-400'} transition-colors`} 
              strokeWidth={2} 
            />
          </div>
        )}
        
        {/* Password Toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            {showPassword ? (
              <EyeOff className={`${sizeStyles[size].icon} text-zinc-400`} strokeWidth={2} />
            ) : (
              <Eye className={`${sizeStyles[size].icon} text-zinc-400`} strokeWidth={2} />
            )}
          </button>
        )}
        
        {/* Clear Button */}
        {clearable && props.value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <X className={`${sizeStyles[size].icon} text-zinc-400`} strokeWidth={2} />
          </button>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <p className="mt-1.5 text-sm text-red-500">{error}</p>
      )}
      
      {/* Hint */}
      {hint && !error && (
        <p className="mt-1.5 text-sm text-zinc-500">{hint}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

/**
 * Search Input Component
 */
export const SearchInput = forwardRef(({ className = '', ...props }, ref) => (
  <Input
    ref={ref}
    type="search"
    icon={Search}
    iconPosition="left"
    placeholder="Search..."
    clearable
    className={className}
    {...props}
  />
));

SearchInput.displayName = 'SearchInput';

/**
 * Textarea Component
 */
export const Textarea = forwardRef(({
  variant = 'default',
  size = 'md',
  label,
  error,
  hint,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  
  // Size variants
  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-sm',
    lg: 'px-4 py-4 text-base',
  };
  
  // Variant styles
  const variantStyles = {
    default: `
      bg-white
      border border-zinc-200
      focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20
      ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
    `,
    filled: `
      bg-zinc-100
      border-2 border-transparent
      focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20
      ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
    `,
  };
  
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
          {label}
        </label>
      )}
      
      <textarea
        ref={ref}
        className={`
          w-full
          rounded-xl
          resize-none
          transition-all duration-200
          placeholder:text-zinc-400
          disabled:opacity-50 disabled:cursor-not-allowed
          ${sizeStyles[size]}
          ${variantStyles[variant]}
          ${className}
        `}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        {...props}
      />
      
      {error && (
        <p className="mt-1.5 text-sm text-red-500">{error}</p>
      )}
      
      {hint && !error && (
        <p className="mt-1.5 text-sm text-zinc-500">{hint}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Input;
