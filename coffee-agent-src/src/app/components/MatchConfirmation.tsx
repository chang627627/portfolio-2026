import { motion } from 'motion/react';

interface MatchConfirmationProps {
  onConfirm: () => void;
  onShowAnother: () => void;
}

export function MatchConfirmation({ onConfirm, onShowAnother }: MatchConfirmationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-[12px]"
    >
      <p className="font-['Inter'] font-normal text-[14px] text-[#304050] text-center mb-2">
        Would you like to schedule a chat with Ella?
      </p>
      
      <button
        onClick={onConfirm}
        className="bg-[#635bff] h-[32px] px-[11px] rounded-[4px] flex items-center justify-center gap-[4px] hover:bg-[#5850e6] transition-colors"
      >
        <p className="font-['Inter'] font-medium text-[14px] text-white leading-[20px]">Meet Ella</p>
      </button>

      <button
        onClick={onShowAnother}
        className="bg-white h-[32px] px-[11px] rounded-[4px] border border-[#d5dbe1] flex items-center justify-center gap-[4px] hover:bg-[#f6f8fa] transition-colors"
      >
        <p className="font-['Inter'] font-medium text-[14px] text-[#8792a2] leading-[20px]">Show me someone else</p>
      </button>
    </motion.div>
  );
}