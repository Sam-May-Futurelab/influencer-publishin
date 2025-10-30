import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Sparkle, BookOpen, Pen, Lightning, Brain, MagicWand } from '@phosphor-icons/react';

interface AILoadingProps {
  progress: number;
  currentMessage?: string;
  messages?: string[];
  messageDelay?: number;
  variant?: 'book' | 'magic' | 'brain' | 'default';
}

const variantConfig = {
  book: {
    icon: BookOpen,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    accentColor: 'bg-blue-500',
  },
  magic: {
    icon: MagicWand,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    accentColor: 'bg-purple-500',
  },
  brain: {
    icon: Brain,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    accentColor: 'bg-pink-500',
  },
  default: {
    icon: Sparkle,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    accentColor: 'bg-primary',
  },
};

export function AILoading({
  progress,
  currentMessage,
  messages = [],
  messageDelay = 2000,
  variant = 'default',
}: AILoadingProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div className="space-y-6">
      {/* Animated Icon Area */}
      <div className="relative flex items-center justify-center h-32">
        {/* Background glow pulse */}
        <motion.div
          className={`absolute w-24 h-24 rounded-full ${config.bgColor} blur-2xl`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Orbiting particles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 0.3,
            }}
          >
            <motion.div
              className={`w-2 h-2 rounded-full ${config.accentColor}`}
              style={{
                x: 40 + i * 10,
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </motion.div>
        ))}

        {/* Center icon with animation */}
        <motion.div
          className={`relative z-10 p-6 rounded-2xl ${config.bgColor} border-2 border-primary/20`}
          animate={{
            y: [-5, 5, -5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Icon size={48} className={config.color} weight="duotone" />
          </motion.div>
        </motion.div>

        {/* Writing effect - pen animation for book variant */}
        {variant === 'book' && (
          <motion.div
            className="absolute right-1/4 top-1/4"
            animate={{
              x: [0, 20, 0],
              y: [0, 10, 0],
              rotate: [0, -15, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Pen size={24} className="text-primary" weight="fill" />
          </motion.div>
        )}

        {/* Sparkles for magic variant */}
        {variant === 'magic' && (
          <>
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: [0, (Math.random() - 0.5) * 100],
                  y: [0, (Math.random() - 0.5) * 100],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: 'easeOut',
                }}
              >
                <Sparkle size={16} className="text-purple-500" weight="fill" />
              </motion.div>
            ))}
          </>
        )}

        {/* Lightning bolts for brain variant */}
        {variant === 'brain' && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
                style={{
                  left: `${30 + i * 20}%`,
                  top: `${20 + i * 15}%`,
                }}
              >
                <Lightning size={20} className="text-pink-500" weight="fill" />
              </motion.div>
            ))}
          </>
        )}
      </div>

      {/* Message Display */}
      <div className="text-center min-h-[60px]">
        <AnimatePresence mode="wait">
          {currentMessage && (
            <motion.div
              key={currentMessage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"
            >
              <p className="text-lg font-semibold">{currentMessage}</p>
              {/* Typing dots */}
              <div className="flex items-center justify-center gap-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`w-2 h-2 rounded-full ${config.accentColor}`}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm font-medium">
          <span className="text-muted-foreground">Progress</span>
          <span className={config.color}>{Math.round(progress)}%</span>
        </div>
        <div className="relative">
          <Progress value={progress} className="h-3" />
          {/* Shimmer effect on progress bar */}
          {progress < 100 && (
            <motion.div
              className="absolute inset-0 h-3 overflow-hidden rounded-full"
              style={{ width: `${progress}%` }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Fun fact or tip (optional) */}
      {messages.length > 0 && (
        <div className={`text-center p-4 rounded-lg ${config.bgColor} border border-primary/10`}>
          <p className="text-sm text-muted-foreground italic">
            💡 {messages[Math.floor((progress / 100) * messages.length) % messages.length]}
          </p>
        </div>
      )}
    </div>
  );
}

// Hook for managing loading messages
export function useLoadingMessages(messages: string[], interval: number = 2000) {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (messages.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, interval);

    return () => clearInterval(timer);
  }, [messages, interval]);

  return messages[currentIndex];
}

// Import React for hook
import React from 'react';
