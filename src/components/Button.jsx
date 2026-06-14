import { Link } from 'react-router-dom';

const variants = {
  primary: 'bg-pink text-white hover:bg-rose-500',
  secondary: 'bg-burgundy text-white hover:bg-rose-800',
  outline: 'bg-white text-burgundy border-2 border-burgundy hover:bg-rose-50',
  muted: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
};

const sizes = {
  sm: 'px-4 py-1.5 text-sm',
  md: 'px-4 py-3',
  lg: 'px-8 py-3',
};

// Filled variants carry a shadow scaled to size; outline/muted are flat.
const shadows = { lg: 'shadow-lg hover:shadow-xl', md: 'shadow-md hover:shadow-lg', sm: '' };

export default function Button({
  children,
  href,
  to,
  download,
  variant = 'primary',
  size = 'lg',
  fullWidth = false,
  className = '',
  ...props
}) {
  const filled = variant === 'primary' || variant === 'secondary';
  const baseClasses = [
    fullWidth ? 'block w-full text-center' : 'inline-block',
    sizes[size],
    'rounded-full font-semibold transition-all',
    filled ? shadows[size] : '',
    variants[variant],
    className,
  ].filter(Boolean).join(' ');

  if (to) {
    return <Link to={to} className={baseClasses} {...props}>{children}</Link>;
  }

  if (href) {
    // Downloads and mailto stay same-tab; other links open externally.
    const external = !download && !href.startsWith('mailto:');
    return (
      <a
        href={href}
        download={download}
        className={baseClasses}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        {...props}
      >
        {children}
      </a>
    );
  }

  return <button className={baseClasses} {...props}>{children}</button>;
}
