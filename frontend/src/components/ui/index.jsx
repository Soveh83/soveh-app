import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';

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
      whileHover={{ scale: 1.02 }}
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -4, boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)' } : undefined}
      className={`
        bg-white rounded-2xl border border-slate-100
        shadow-sm ${hover ? 'hover:shadow-xl' : ''}
        transition-all duration-300
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
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700'
  };
  
  return (
    <motion.span 
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full
        text-xs font-medium
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </motion.span>
  );
};

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };
  
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <Loader2 className={`text-slate-400 ${sizes[size]} ${className}`} />
    </motion.div>
  );
};

// Page transition wrapper
export const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

// Stagger container for lists
export const StaggerContainer = ({ children, className = '' }) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.05
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Stagger item
export const StaggerItem = ({ children, className = '' }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Modal component
export const Modal = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto bg-white rounded-2xl shadow-2xl z-50 max-h-[90vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">{title}</h3>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-60px)]">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Skeleton loader
export const Skeleton = ({ className = '' }) => {
  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className={`bg-slate-200 rounded-lg ${className}`}
    />
  );
};

// Success animation
export const SuccessAnimation = () => {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
      >
        <CheckCircle className="w-8 h-8 text-emerald-600" />
      </motion.div>
    </motion.div>
  );
};
