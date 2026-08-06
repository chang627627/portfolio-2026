import { useState } from 'react';
import { motion } from 'motion/react';

interface ReflectionViewProps {
  onComplete: () => void;
}

export function ReflectionView({ onComplete }: ReflectionViewProps) {
  const [selectedFeedback, setSelectedFeedback] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [comment, setComment] = useState('');

  const ratings = [
    { value: 1, emoji: '😞', label: 'Not great' },
    { value: 2, emoji: '😐', label: 'Okay' },
    { value: 3, emoji: '🙂', label: 'Good' },
    { value: 4, emoji: '😊', label: 'Great' },
    { value: 5, emoji: '🤩', label: 'Amazing' }
  ];

  const handleSubmit = () => {
    if (!selectedFeedback) return;
    setIsSubmitted(true);
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center justify-center py-12 gap-4"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 10, 0], y: [0, -10, 0] }}
          transition={{ duration: 1, repeat: 2 }}
          className="text-6xl"
        >
          ☕
        </motion.div>
        <p className="font-['Inter'] font-medium text-[16px] text-[#041c33] text-center">
          Thanks for the feedback!
        </p>
        <p className="font-['Inter'] font-normal text-[14px] text-[#304050] text-center">
          Let's spark another connection soon
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-[24px]"
    >
      <div className="text-center">
        <p className="font-['Inter'] font-medium text-[16px] text-[#041c33] mb-2">
          How was your chat with Ella?
        </p>
        <p className="font-['Inter'] font-normal text-[14px] text-[#304050]">
          Your feedback helps us make better connections
        </p>
      </div>

      {/* Rating Selector */}
      <div className="flex justify-between gap-2">
        {ratings.map((item) => (
          <motion.button
            key={item.value}
            onClick={() => setSelectedFeedback(item.value)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex flex-col items-center gap-2 p-2 rounded-[4px] flex-1 transition-all ${
              selectedFeedback === item.value
                ? 'bg-[#f6f8fa] border-2 border-[#635bff]'
                : 'border-2 border-transparent hover:bg-[#f6f8fa]'
            }`}
          >
            <motion.div
              animate={selectedFeedback === item.value ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
              className="text-2xl"
            >
              {item.emoji}
            </motion.div>
            <span className={`font-['Inter'] text-[11px] whitespace-nowrap ${
              selectedFeedback === item.value ? 'text-[#635bff] font-medium' : 'text-[#8792a2] font-normal'
            }`}>
              {item.label}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Optional Comment */}
      {selectedFeedback && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <textarea
            placeholder="Want to share more? (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full h-[80px] bg-white border border-[#d5dbe1] rounded-[4px] px-3 py-2 font-['Inter'] font-normal text-[14px] text-[#041c33] resize-none focus:outline-none focus:border-[#635bff] transition-colors"
          />
        </motion.div>
      )}

      {/* Submit Button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={handleSubmit}
        disabled={!selectedFeedback}
        className={`h-[32px] px-[11px] py-[6px] rounded-[4px] flex items-center justify-center gap-[4px] transition-colors ${
          selectedFeedback
            ? 'bg-[#635bff] hover:bg-[#5850e6] cursor-pointer'
            : 'bg-[#d5dbe1] cursor-not-allowed'
        }`}
      >
        <p className="font-['Inter'] font-medium text-[14px] text-white leading-[20px]">
          Submit Feedback
        </p>
      </motion.button>
    </motion.div>
  );
}