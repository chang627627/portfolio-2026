import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { PastChat } from './matchData';

interface PastChatsProps {
  chats: PastChat[];
}

export function PastChats({ chats }: PastChatsProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-[#f6f8fa] rounded-[4px] border border-[#d5dbe1]">
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="w-full flex items-center justify-between gap-[12px] p-3 text-left"
      >
        <p className="font-['Inter'] font-normal text-[14px] text-[#041c33] leading-[20px]">
          You have met {chats.length} {chats.length === 1 ? 'person' : 'people'} this quarter
        </p>
        <motion.svg
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-4 h-4 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path d="M6 9L12 15L18 9" stroke="#8792a2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-[8px] px-3 pb-3">
              {chats.map(chat => (
                <div key={chat.id} className="flex items-center gap-[12px] bg-white rounded-[4px] border border-[#d5dbe1] p-3">
                  <div className="size-[32px] rounded-full bg-gradient-to-br from-[#7c75ff] to-[#635bff] flex items-center justify-center flex-shrink-0">
                    <span className="font-['Inter'] font-medium text-[12px] text-white leading-[18px]">
                      {chat.initials}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-['Inter'] font-medium text-[14px] text-[#041c33] leading-[20px]">
                      {chat.name}
                    </p>
                    <p className="font-['Inter'] font-normal text-[12px] text-[#8792a2] leading-[18px]">
                      {chat.date}
                    </p>
                  </div>
                  <span className="text-[16px] leading-[24px]" aria-hidden="true">{chat.reaction}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
