import { motion } from 'framer-motion';
import { MagicWand, Lightbulb, PencilSimple, Star } from '@phosphor-icons/react';

interface AILoadingProps {
  className?: string;
}

const loadingPhrases = [
  { text: "🧠 Brewing brilliant ideas...", icon: Lightbulb },
  { text: "✨ Crafting your content...", icon: MagicWand },
  { text: "📝 Weaving words together...", icon: PencilSimple },
  { text: "🎯 Polishing your prose...", icon: Star },
  { text: "🔥 Cooking up creativity...", icon: MagicWand },
  { text: "💡 Generating genius...", icon: Lightbulb },
  { text: "🚀 Launching literary magic...", icon: Star },
  { text: "🎨 Painting with words...", icon: PencilSimple },
  { text: "⚡ Sparking inspiration...", icon: MagicWand },
  { text: "🌟 Sprinkling story dust...", icon: Star }
];

export function AILoading({ className = '' }: AILoadingProps) {
  // Pick a random phrase
  const randomPhrase = loadingPhrases[Math.floor(Math.random() * loadingPhrases.length)];
  const IconComponent = randomPhrase.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`flex flex-col items-center justify-center p-6 lg:p-8 ${className}`}
    >
      {/* Animated Icon */}
      <motion.div
        animate={{ 
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="p-4 lg:p-6 rounded-full neomorph-flat mb-4 lg:mb-6"
      >
        <IconComponent 
          size={32} 
          className="lg:hidden text-primary" 
        />
        <IconComponent 
          size={48} 
          className="hidden lg:block text-primary" 
        />
      </motion.div>

      {/* Loading Text */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-sm lg:text-base font-medium text-foreground text-center mb-3 lg:mb-4"
      >
        {randomPhrase.text}
      </motion.p>

      {/* Animated Dots */}
      <div className="flex gap-1 lg:gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
            className="w-2 h-2 lg:w-3 lg:h-3 rounded-full bg-primary neomorph-flat"
          />
        ))}
      </div>

      {/* Progress Bar */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ 
          duration: 3,
          ease: "easeInOut"
        }}
        className="mt-4 lg:mt-6 h-1 lg:h-1.5 bg-gradient-to-r from-primary/30 via-primary to-primary/30 rounded-full neomorph-inset w-32 lg:w-48 overflow-hidden"
      >
        <motion.div
          animate={{ x: [-100, 200] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
          className="h-full w-8 lg:w-12 bg-gradient-to-r from-transparent via-white/50 to-transparent"
        />
      </motion.div>

      {/* Helpful Tip */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-xs text-muted-foreground text-center mt-4 lg:mt-6 max-w-xs lg:max-w-sm leading-relaxed"
      >
        💫 Tip: The more specific your keywords, the better your content will be!
      </motion.p>
    </motion.div>
  );
}
