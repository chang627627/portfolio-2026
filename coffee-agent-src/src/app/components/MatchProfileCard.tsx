import { motion } from 'motion/react';
import imgGroup202 from "figma:asset/d56aaa0b5b0d6767c6dae1e50d0d43d6a7767346.png";

export function MatchProfileCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-[#d5dbe1] rounded-[8px] p-4"
    >
      <div className="flex items-center gap-3">
        <div className="size-[48px] rounded-full overflow-hidden flex-shrink-0">
          <img src={imgGroup202} alt="Ella Kim" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <p className="font-['Inter'] font-medium text-[16px] text-[#041c33] leading-normal">Ella Kim</p>
          <p className="font-['Inter'] font-normal text-[14px] text-[#304050] leading-normal">Product Designer</p>
        </div>
      </div>
    </motion.div>
  );
}
