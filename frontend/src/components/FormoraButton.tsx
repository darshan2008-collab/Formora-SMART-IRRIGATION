import React from 'react';

export interface FormoraButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'farm' | 'emerald' | 'danger' | 'secondary' | 'outline' | 'dark';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  children: React.ReactNode;
}

export const FormoraButton: React.FC<FormoraButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const variantClass = {
    primary: 'btn-17-primary',
    farm: 'btn-17-farm',
    emerald: 'btn-17-emerald',
    danger: 'btn-17-danger',
    secondary: 'btn-17-secondary',
    outline: 'btn-17-outline',
    dark: 'btn-17-dark',
  }[variant] || 'btn-17-primary';

  const sizeClass = {
    xs: 'btn-17-xs',
    sm: 'btn-17-sm',
    md: 'btn-17-md',
    lg: 'btn-17-lg',
    xl: 'btn-17-xl',
  }[size] || 'btn-17-md';

  const widthClass = fullWidth ? 'btn-17-full w-full' : '';

  return (
    <button
      className={`btn-17 ${variantClass} ${sizeClass} ${widthClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      <span className="text-container">
        <span className="text">
          {loading ? (
            <svg
              className="animate-spin h-4 w-4"
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
          ) : (
            <>
              {icon && iconPosition === 'left' && icon}
              <span>{children}</span>
              {icon && iconPosition === 'right' && icon}
            </>
          )}
        </span>
      </span>
    </button>
  );
};
