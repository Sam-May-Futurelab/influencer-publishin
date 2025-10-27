import { motion } from 'framer-motion';
import { MagicWand, Lightbulb, PencilSimple, Sparkle } from '@phosphor-icons/react';

interface AILoadingProps {
  className?: string;
}

const loadingPhrases = [
  { text: "Analyzing your content...", icon: Lightbulb },
  { text: "Crafting suggestions...", icon: MagicWand },
  { text: "Weaving words together...", icon: PencilSimple },
  { text: "Polishing your prose...", icon: Sparkle },
  { text: "Generating content...", icon: MagicWand },
  { text: "Enhancing readability...", icon: Lightbulb },
  { text: "Optimizing structure...", icon: Sparkle },
  { text: "Refining language...", icon: PencilSimple },
  { text: "Processing request...", icon: MagicWand },
  { text: "Creating content...", icon: Sparkle }
];

export function AILoading({ className = '' }: AILoadingProps) {
  // Pick a random phrase
  const randomPhrase = loadingPhrases[Math.floor(Math.random() * loadingPhrases.length)];
  const IconComponent = randomPhrase.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`flex flex-col items-center justify-center p-8 lg:p-12 ${className}`}
    >
      {/* Animated Icon */}
      <motion.div
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="p-6 lg:p-8 rounded-2xl bg-primary/5 border border-primary/10 mb-6 lg:mb-8"
      >
        <IconComponent 
          size={40} 
          className="lg:hidden text-primary" 
          weight="duotone"
        />
        <IconComponent 
          size={56} 
          className="hidden lg:block text-primary" 
          weight="duotone"
        />
      </motion.div>

      {/* Loading Text */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-base lg:text-lg font-medium text-foreground text-center mb-6 lg:mb-8"
      >
        {randomPhrase.text}
      </motion.p>

      {/* Animated Dots */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
            className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full bg-primary"
          />
        ))}
      </div>

      {/* Progress Bar */}
      <motion.div
        className="mt-8 lg:mt-10 h-1 bg-border rounded-full w-48 lg:w-64 overflow-hidden"
      >
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="h-full w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent"
        />
      </motion.div>

      {/* Helpful Tip */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-xs text-muted-foreground text-center mt-6 lg:mt-8 max-w-xs lg:max-w-sm leading-relaxed"
      >
        Tip: Be specific with your keywords for better results
      </motion.p>
    </motion.div>
  );
}
