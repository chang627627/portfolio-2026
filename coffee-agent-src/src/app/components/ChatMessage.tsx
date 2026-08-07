import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { AIAgent } from './AIAgent';

interface Message {
  id: number;
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
  stream?: boolean;
  generated?: boolean;
}

interface ChatMessageProps {
  message: Message;
}

/** Reveals text progressively so Luna's replies read as generated, not pasted */
function useTypewriter(text: string, enabled: boolean) {
  const [shown, setShown] = useState(enabled ? '' : text);

  useEffect(() => {
    if (!enabled) {
      setShown(text);
      return;
    }
    let index = 0;
    const interval = window.setInterval(() => {
      index += 2;
      setShown(text.slice(0, index));
      if (index >= text.length) window.clearInterval(interval);
    }, 24);
    return () => window.clearInterval(interval);
  }, [text, enabled]);

  return shown;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAI = message.type === 'ai';
  const text = useTypewriter(message.content, Boolean(message.stream) && isAI);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start gap-3 ${isAI ? '' : 'flex-row-reverse'}`}
    >
      {isAI && <AIAgent size="sm" />}

      <div
        className={`rounded-[8px] px-4 py-3 max-w-[340px] ${
          isAI
            ? 'bg-[#f6f8fa] text-[#041c33] border border-[#d5dbe1]'
            : 'bg-[#635bff] text-white'
        }`}
      >
        <p className="font-['Inter'] font-normal text-[14px] leading-[20px]">
          {text}
          {isAI && message.stream && text.length < message.content.length && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="inline-block w-[2px] h-[14px] bg-[#635bff] align-middle ml-[2px]"
            />
          )}
        </p>
        {isAI && message.generated && text.length >= message.content.length && (
          <span
            title="This reply was generated live by Claude Haiku. The flow around it is the scripted prototype."
            className="block mt-[6px] font-['Inter'] font-normal text-[11px] leading-[14px] text-[#8792a2] cursor-help"
          >
            · generated
          </span>
        )}
      </div>
    </motion.div>
  );
}
