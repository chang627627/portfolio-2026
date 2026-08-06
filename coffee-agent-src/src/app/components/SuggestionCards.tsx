import { motion } from 'motion/react';
import type { Reason } from './matchData';

interface SuggestionCardsProps {
  reasons: Reason[];
}

export function SuggestionCards({ reasons }: SuggestionCardsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-[8px]"
    >
      {reasons.map((reason, index) => (
        <motion.div
          key={reason.text}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white min-h-[54px] rounded-[4px] border border-dashed border-[#d5dbe1] flex items-start gap-[12px] p-[16px]"
        >
          <div className="w-[16px] h-[16px] flex-shrink-0 mt-[2px]">
            {/* Recommendation Icon */}
            <svg className="w-full h-full" fill="none" viewBox="0 0 16 16">
              <circle cx="8" cy="8" r="8" fill="#635BFF"/>
              <path d="M11.3333 5.5L6.83333 10L4.66667 7.83333" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex flex-col gap-[4px] flex-1">
            <p className="font-['Inter'] font-normal text-[14px] text-[#304050] leading-[20px]">
              {reason.text}
            </p>
            {/* Receipt — makes Luna's reasoning inspectable */}
            <p className="font-['Inter'] font-normal text-[12px] text-[#8792a2] leading-[18px]">
              {reason.source}
            </p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
