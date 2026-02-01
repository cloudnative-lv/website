import { Link } from 'react-router-dom';

const variants = {
  primary: 'bg-pink text-white hover:bg-rose-500',
  secondary: 'bg-burgundy text-white hover:bg-rose-800',
  outline: 'bg-white text-burgundy border-2 border-burgundy hover:bg-rose-50'
};

export default function Button({ 
  children, 
  href, 
  to, 
  variant = 'primary', 
  className = '',
  ...props 
}) {
  const baseClasses = `inline-block px-8 py-3 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl ${variants[variant]} ${className}`;
  
  if (to) {
    return (
      <Link to={to} className={baseClasses} {...props}>
        {children}
      </Link>
    );
  }
  
  if (href) {
    return (
      <a 
        href={href} 
        className={baseClasses}
        target={href.startsWith('mailto:') ? undefined : '_blank'}
        rel={href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
        {...props}
      >
        {children}
      </a>
    );
  }
  
  return (
    <button className={baseClasses} {...props}>
      {children}
    </button>
  );
}
