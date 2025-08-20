import { FiLoader } from 'react-icons/fi';

export function Spinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`inline-block ${className}`}>
      <FiLoader 
        className={`${sizeClasses[size]} animate-spin text-blue-600`} 
        aria-hidden="true"
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export default Spinner;
