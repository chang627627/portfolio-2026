import { motion } from 'motion/react';

interface QuickRepliesProps {
  onReply: (reply: string, nextMessage?: string) => void;
}

export function QuickReplies({ onReply }: QuickRepliesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-[12px]"
    >
      <button
        onClick={() => onReply(
          "Sounds great!",
          "Great! How would you prefer to meet?"
        )}
        className="bg-[#635bff] h-[32px] px-[11px] rounded-[4px] flex items-center justify-center gap-[4px] hover:bg-[#5850e6] transition-colors"
      >
        <p className="font-['Inter'] font-medium text-[14px] text-white leading-[20px]">Sounds great!</p>
      </button>

      <button
        onClick={() => onReply(
          "Maybe later",
          "No worries! I'll check back with you next week."
        )}
        className="bg-white h-[32px] px-[11px] rounded-[4px] border border-[#d5dbe1] flex items-center justify-center gap-[4px] hover:bg-[#f6f8fa] transition-colors"
      >
        <p className="font-['Inter'] font-medium text-[14px] text-[#8792a2] leading-[20px]">Maybe later</p>
      </button>
    </motion.div>
  );
}