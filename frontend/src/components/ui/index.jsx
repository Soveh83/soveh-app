import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const roleColors = {
  retailer: 'bg-blue-600 hover:bg-blue-700',
  customer: 'bg-green-600 hover:bg-green-700',
  delivery: 'bg-orange-600 hover:bg-orange-700',
  admin: 'bg-red-600 hover:bg-red-700',
  default: 'bg-slate-900 hover:bg-slate-800'
};

const outlineColors = {
  retailer: 'border-blue-600 text-blue-600 hover:bg-blue-50',
  customer: 'border-green-600 text-green-600 hover:bg-green-50',
  delivery: 'border-orange-600 text-orange-600 hover:bg-orange-50',
  admin: 'border-red-600 text-red-600 hover:bg-red-50',
  default: 'border-slate-900 text-slate-900 hover:bg-slate-50'
};

export const Button = ({
  children,
  variant = 'primary',
  role = 'default',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-5 py-2.5 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl'
  };
  
  const variantStyles = variant === 'outline'
    ? `border-2 bg-transparent ${outlineColors[role]}`
    : `text-white shadow-sm hover:shadow-md ${roleColors[role]}`;
  
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </motion.button>
  );
};

export const Input = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        className={`
          w-full h-11 px-4 rounded-xl
          bg-slate-50 border border-slate-200
          text-slate-900 placeholder-slate-400
          focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export const Card = ({ children, className = '', hover = false, ...props }) => {
  return (
    <motion.div
      whileHover={hover ? { y: -2 } : undefined}
      className={`
        bg-white rounded-xl border border-slate-100
        shadow-sm ${hover ? 'hover:shadow-md' : ''}
        transition-all duration-200
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700'
  };
  
  return (
    <span className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full
      text-xs font-medium
      ${variants[variant]}
      ${className}
    `}>
      {children}
    </span>
  );
};

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };
  
  return (
    <Loader2 className={`animate-spin text-slate-400 ${sizes[size]} ${className}`} />
  );
};
