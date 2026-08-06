import { motion } from 'motion/react';

interface AIAgentProps {
  isTyping?: boolean;
  size?: 'sm' | 'md';
}

export function AIAgent({ isTyping }: AIAgentProps) {
  return (
    <motion.div
      animate={{
        scale: isTyping
          ? [1, 1.05, 1]
          : 1
      }}
      transition={{
        duration: 1.5,
        repeat: isTyping ? Infinity : 0
      }}
      className="size-[40px] rounded-full bg-gradient-to-br from-[#7c75ff] to-[#635bff] flex items-center justify-center flex-shrink-0"
    >
      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C11.45 2 11 2.45 11 3V4H8C6.9 4 6 4.9 6 6V18C6 19.1 6.9 20 8 20H16C17.1 20 18 19.1 18 18V6C18 4.9 17.1 4 16 4H13V3C13 2.45 12.55 2 12 2ZM9 9H11V11H9V9ZM9 12H11V14H9V12ZM15 9V11H13V9H15ZM15 12V14H13V12H15ZM8 16V17H16V16H8Z"/>
      </svg>
    </motion.div>
  );
}