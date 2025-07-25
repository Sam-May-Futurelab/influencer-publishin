import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export function LoadingSpinner({ size = 16, className = '' }: LoadingSpinnerProps) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={`inline-block ${className}`}
      style={{ width: size, height: size }}
    >
      <div 
        className="border-2 border-current border-t-transparent rounded-full"
        style={{ width: size, height: size }}
      />
    </motion.div>
  );
}
