import { useState } from 'react';
import { motion } from 'motion/react';

interface SchedulingViewProps {
  onScheduled: () => void;
  meetingPreference?: 'online' | 'in-person' | null;
}

interface TimeSlot {
  day: number;
  hour: number;
  available: boolean;
  bothAvailable: boolean;
}

export function SchedulingView({ onScheduled, meetingPreference }: SchedulingViewProps) {
  const [selectedSlot, setSelectedSlot] = useState<{ day: number; hour: number } | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);

  // Sample availability data - in a real app, this would come from the backend
  const availability: TimeSlot[] = [
    // Monday (21)
    { day: 21, hour: 10, available: true, bothAvailable: true },
    { day: 21, hour: 11, available: true, bothAvailable: false },
    { day: 21, hour: 14, available: true, bothAvailable: false },
    
    // Tuesday (22)
    { day: 22, hour: 10, available: true, bothAvailable: true },
    { day: 22, hour: 11, available: true, bothAvailable: true },
    { day: 22, hour: 14, available: true, bothAvailable: false },
    { day: 22, hour: 17, available: true, bothAvailable: true },
    
    // Wednesday (23)
    { day: 23, hour: 10, available: true, bothAvailable: false },
    { day: 23, hour: 11, available: true, bothAvailable: true },
    { day: 23, hour: 14, available: true, bothAvailable: true },
    { day: 23, hour: 15, available: true, bothAvailable: true },
    { day: 23, hour: 17, available: true, bothAvailable: false },
    
    // Thursday (24)
    { day: 24, hour: 10, available: true, bothAvailable: true },
    { day: 24, hour: 11, available: true, bothAvailable: true },
    { day: 24, hour: 14, available: true, bothAvailable: false },
    { day: 24, hour: 17, available: true, bothAvailable: true },
    { day: 24, hour: 18, available: true, bothAvailable: true },
    
    // Friday (25)
    { day: 25, hour: 10, available: true, bothAvailable: false },
    { day: 25, hour: 11, available: true, bothAvailable: true },
    { day: 25, hour: 12, available: true, bothAvailable: true },
    { day: 25, hour: 14, available: true, bothAvailable: true },
    { day: 25, hour: 17, available: true, bothAvailable: true },
  ];

  const days = [
    { name: 'MON', date: 21 },
    { name: 'TUE', date: 22 },
    { name: 'WED', date: 23 },
    { name: 'THU', date: 24 },
    { name: 'FRI', date: 25 },
  ];

  const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

  const getSlotAvailability = (day: number, hour: number) => {
    return availability.find(slot => slot.day === day && slot.hour === hour);
  };

  const formatTime = (hour: number) => {
    if (hour === 12) return '12 PM';
    if (hour > 12) return `${hour - 12} PM`;
    return `${hour} AM`;
  };

  const handleSlotClick = (day: number, hour: number) => {
    const slot = getSlotAvailability(day, hour);
    if (slot?.bothAvailable) {
      setSelectedSlot({ day, hour });
    }
  };

  const handleSubmit = () => {
    if (!selectedSlot) return;
    setIsConfirmed(true);
    setTimeout(() => {
      onScheduled();
    }, 1500);
  };

  if (isConfirmed) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center justify-center py-12 gap-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-16 h-16 bg-[#635bff] rounded-full flex items-center justify-center"
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24">
            <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
        <p className="font-['Inter'] font-medium text-[16px] text-[#041c33] text-center">
          Chat scheduled successfully!
        </p>
        {meetingPreference === 'online' ? (
          <p className="font-['Inter'] font-normal text-[14px] text-[#304050] text-center max-w-[280px]">
            A Google Calendar invite has been sent to both you and Ella
          </p>
        ) : (
          <p className="font-['Inter'] font-normal text-[14px] text-[#304050] text-center">
            Looking forward to your conversation
          </p>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-[20px]"
    >
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="font-['Inter'] font-medium text-[16px] text-[#041c33]">Availabilities</p>
          <p className="font-['Inter'] font-normal text-[12px] text-[#8792a2]">July 2024</p>
        </div>
        <p className="font-['Inter'] font-normal text-[12px] text-[#304050]">
          Select a time that works for both of you
        </p>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[340px]">
          {/* Day Headers */}
          <div className="grid grid-cols-[40px_repeat(5,1fr)] gap-[1px] mb-[1px]">
            <div className="h-[32px]"></div>
            {days.map((day) => (
              <div
                key={day.date}
                className="text-center"
              >
                <p className="font-['Inter'] font-medium text-[11px] text-[#8792a2] uppercase">
                  {day.name}
                </p>
                <p className="font-['Inter'] font-normal text-[14px] text-[#041c33]">
                  {day.date}
                </p>
              </div>
            ))}
          </div>

          {/* Time Grid */}
          <div className="bg-[#f6f8fa] rounded-[4px] border border-[#d5dbe1] overflow-hidden">
            {hours.map((hour, hourIndex) => (
              <div
                key={hour}
                className="grid grid-cols-[40px_repeat(5,1fr)] gap-[1px]"
                style={{
                  borderBottom: hourIndex < hours.length - 1 ? '1px solid #d5dbe1' : 'none'
                }}
              >
                {/* Time Label */}
                <div className="h-[36px] flex items-center justify-start px-2 bg-white">
                  <p className="font-['Inter'] font-normal text-[10px] text-[#8792a2]">
                    {formatTime(hour)}
                  </p>
                </div>

                {/* Day Cells */}
                {days.map((day) => {
                  const slot = getSlotAvailability(day.date, hour);
                  const isSelected = selectedSlot?.day === day.date && selectedSlot?.hour === hour;
                  
                  return (
                    <button
                      key={`${day.date}-${hour}`}
                      onClick={() => handleSlotClick(day.date, hour)}
                      disabled={!slot?.bothAvailable}
                      className={`h-[36px] transition-all relative ${
                        slot?.bothAvailable
                          ? isSelected
                            ? 'bg-[#635bff] cursor-pointer hover:bg-[#5850e6]'
                            : 'bg-[#9BE8C5] cursor-pointer hover:bg-[#7dd9b3]'
                          : slot?.available
                          ? 'bg-[#E8F5EE] cursor-not-allowed'
                          : 'bg-white cursor-not-allowed'
                      }`}
                    >
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </motion.div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[11px]">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#9BE8C5] rounded-[2px]"></div>
          <span className="font-['Inter'] font-normal text-[#304050]">Both available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#E8F5EE] rounded-[2px]"></div>
          <span className="font-['Inter'] font-normal text-[#304050]">Partial availability</span>
        </div>
      </div>

      {/* Responders */}
      <div className="bg-[#f6f8fa] rounded-[4px] border border-[#d5dbe1] p-3">
        <p className="font-['Inter'] font-medium text-[12px] text-[#041c33] mb-2">
          Responders (2)
        </p>
        <div className="flex flex-col gap-1">
          <p className="font-['Inter'] font-normal text-[12px] text-[#304050]">Alex Chen</p>
          <p className="font-['Inter'] font-normal text-[12px] text-[#304050]">Ella Kim</p>
        </div>
      </div>

      {/* Selected Time Display */}
      {selectedSlot && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#f6f8fa] rounded-[4px] border border-[#635bff] p-3"
        >
          <p className="font-['Inter'] font-normal text-[14px] text-[#041c33]">
            Selected: {days.find(d => d.date === selectedSlot.day)?.name} July {selectedSlot.day} @ {formatTime(selectedSlot.hour)}
          </p>
        </motion.div>
      )}

      {/* Submit Button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={handleSubmit}
        disabled={!selectedSlot}
        className={`h-[32px] px-[11px] rounded-[4px] flex items-center justify-center gap-[4px] transition-colors ${
          selectedSlot
            ? 'bg-[#635bff] hover:bg-[#5850e6] cursor-pointer'
            : 'bg-[#d5dbe1] cursor-not-allowed'
        }`}
      >
        <p className="font-['Inter'] font-medium text-[14px] text-white leading-[20px]">
          {selectedSlot ? 'Confirm Time' : 'Select a time slot'}
        </p>
      </motion.button>

      {/* Manual Availability Input Button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setShowManualInput(true)}
        className="bg-white h-[32px] px-[11px] rounded-[4px] border border-[#d5dbe1] flex items-center justify-center gap-[4px] hover:bg-[#f6f8fa] transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
          <path d="M12 5V19M5 12H19" stroke="#8792a2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p className="font-['Inter'] font-medium text-[14px] text-[#8792a2] leading-[20px]">
          Add availability manually
        </p>
      </motion.button>

      {/* Manual Input Dialog */}
      {showManualInput && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowManualInput(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[8px] border border-[#d5dbe1] p-[21px] max-w-[360px] w-full mx-4"
          >
            <div className="flex flex-col gap-[20px]">
              {/* Header */}
              <div>
                <p className="font-['Inter'] font-medium text-[16px] text-[#041c33] mb-1">
                  Add Your Availability
                </p>
                <p className="font-['Inter'] font-normal text-[12px] text-[#304050]">
                  Enter a time that works for you
                </p>
              </div>

              {/* Date Input */}
              <div className="flex flex-col gap-2">
                <label className="font-['Inter'] font-medium text-[12px] text-[#041c33]">
                  Date
                </label>
                <input
                  type="date"
                  className="h-[32px] px-3 py-2 rounded-[4px] border border-[#d5dbe1] font-['Inter'] font-normal text-[14px] text-[#041c33] focus:outline-none focus:border-[#635bff]"
                />
              </div>

              {/* Time Input */}
              <div className="flex flex-col gap-2">
                <label className="font-['Inter'] font-medium text-[12px] text-[#041c33]">
                  Time
                </label>
                <input
                  type="time"
                  className="h-[32px] px-3 py-2 rounded-[4px] border border-[#d5dbe1] font-['Inter'] font-normal text-[14px] text-[#041c33] focus:outline-none focus:border-[#635bff]"
                />
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-[12px]">
                <button
                  onClick={() => {
                    // In a real app, this would save the manual availability
                    setShowManualInput(false);
                  }}
                  className="bg-[#635bff] h-[32px] px-[11px] rounded-[4px] flex items-center justify-center gap-[4px] hover:bg-[#5850e6] transition-colors"
                >
                  <p className="font-['Inter'] font-medium text-[14px] text-white leading-[20px]">
                    Submit Availability
                  </p>
                </button>
                <button
                  onClick={() => setShowManualInput(false)}
                  className="bg-white h-[32px] px-[11px] rounded-[4px] border border-[#d5dbe1] flex items-center justify-center gap-[4px] hover:bg-[#f6f8fa] transition-colors"
                >
                  <p className="font-['Inter'] font-medium text-[14px] text-[#8792a2] leading-[20px]">
                    Cancel
                  </p>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}