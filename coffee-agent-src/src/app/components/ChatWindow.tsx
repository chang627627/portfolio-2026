import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage } from './ChatMessage';
import { AIAgent } from './AIAgent';
import { SuggestionCards } from './SuggestionCards';
import { PastChats } from './PastChats';
import { parseIntent } from './intent';
import {
  matches,
  pastChats as seedPastChats,
  days,
  hours,
  formatTime,
  formatSlot,
  shortSlot,
  type Match,
  type PastChat,
  type Slot,
} from './matchData';
import ErrorWarningLine1 from '../imports/ErrorWarningLine1';

type PromptType = 'proposal' | 'match' | 'timeSlot' | 'reflection' | 'idle' | null;

interface Message {
  id: number;
  type: 'ai' | 'user' | 'card' | 'suggestions' | 'divider';
  content: string;
  timestamp: Date;
  cardType?: 'profile' | 'success';
  matchId?: string;
  stream?: boolean;
}

type Step =
  | { kind: 'say'; text: string }
  | { kind: 'card'; cardType: 'profile' | 'success'; content: string; matchId?: string }
  | { kind: 'reasons'; matchId: string }
  | { kind: 'divider'; text: string }
  | { kind: 'prompt'; prompt: PromptType }
  | { kind: 'wait'; ms: number };

const reflectionOptions = [
  {
    label: '😊 Great, we clicked',
    note: "Noted. I'll keep looking for people in adjacent creative roles.",
  },
  {
    label: '💡 Useful, a bit formal',
    note: "Noted. I'll suggest in-person spots next time. They tend to loosen things up.",
  },
  {
    label: '😐 It was fine',
    note: "Noted. I'll look for someone with more overlap with your day-to-day work.",
  },
  {
    label: "🙁 Didn't click",
    note: "Sorry that one missed. I'll prioritize people outside Marketing's orbit next time.",
  },
];

export function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [busy, setBusy] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<PromptType>(null);
  const [meetingPreference, setMeetingPreference] = useState<'online' | 'in-person'>('online');
  const [matchIndex, setMatchIndex] = useState(0);
  const [proposedSlot, setProposedSlot] = useState<Slot>(matches[0].proposedSlot);
  const [selectedCalendarSlot, setSelectedCalendarSlot] = useState<Slot | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualDate, setManualDate] = useState('');
  const [manualTime, setManualTime] = useState('');
  const [history, setHistory] = useState<PastChat[]>(seedPastChats);
  const [seenMatchIds, setSeenMatchIds] = useState<string[]>([matches[0].id]);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<number[]>([]);
  const cancelledRef = useRef(false);
  // Mirrors matchIndex so async scripts read the value at the time they run
  const matchIndexRef = useRef(0);

  const currentMatch = matches[matchIndex];

  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping, currentPrompt]);


  const sleep = (ms: number) =>
    new Promise<void>(resolve => {
      const id = window.setTimeout(resolve, ms);
      timeoutsRef.current.push(id);
    });

  const push = (message: Omit<Message, 'id' | 'timestamp'>) => {
    setMessages(prev => [
      ...prev,
      { ...message, id: Date.now() + Math.random(), timestamp: new Date() },
    ]);
  };

  /**
   * Plays a scripted sequence. Streaming replaces the old fixed "thinking"
   * pause: a short beat, then the text reveals at reading speed.
   */
  const runSteps = async (steps: Step[]) => {
    setBusy(true);
    setCurrentPrompt(null);

    for (const step of steps) {
      if (cancelledRef.current) return;

      if (step.kind === 'say') {
        setIsTyping(true);
        await sleep(650);
        setIsTyping(false);
        push({ type: 'ai', content: step.text, stream: true });
        // Matches the reveal rate in ChatMessage (2 chars every 24ms),
        // plus a beat to finish reading before the next message lands
        await sleep(Math.min(step.text.length * 12 + 400, 3000));
      } else if (step.kind === 'card') {
        push({ type: 'card', cardType: step.cardType, content: step.content, matchId: step.matchId });
        await sleep(400);
      } else if (step.kind === 'reasons') {
        push({ type: 'suggestions', content: 'Why Luna picked this', matchId: step.matchId });
        await sleep(500);
      } else if (step.kind === 'divider') {
        push({ type: 'divider', content: step.text });
        await sleep(400);
      } else if (step.kind === 'prompt') {
        setCurrentPrompt(step.prompt);
      } else if (step.kind === 'wait') {
        await sleep(step.ms);
      }
    }

    setBusy(false);
  };

  // Luna opens with a decision already made, not an interview.
  // Cancelling on cleanup also makes this safe under StrictMode's double mount:
  // the first run is abandoned mid-sleep and the second starts from a clean slate.
  useEffect(() => {
    cancelledRef.current = false;
    setMessages([]);
    const match = matches[0];
    runSteps([
      { kind: 'say', text: `Morning, Kevin. I lined up your coffee chat for next week.` },
      { kind: 'card', cardType: 'profile', content: match.name, matchId: match.id },
      {
        kind: 'say',
        text: `${match.firstName} from ${match.team}. You're both free ${shortSlot(match.proposedSlot)}. Want me to book it?`,
      },
      { kind: 'reasons', matchId: match.id },
      { kind: 'prompt', prompt: 'proposal' },
    ]);

    return () => {
      cancelledRef.current = true;
      timeoutsRef.current.forEach(id => window.clearTimeout(id));
      timeoutsRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const proposeMatch = (match: Match, index: number, lead: string) => {
    setMatchIndex(index);
    matchIndexRef.current = index;
    setProposedSlot(match.proposedSlot);
    setSelectedCalendarSlot(null);
    setSeenMatchIds(prev => (prev.includes(match.id) ? prev : [...prev, match.id]));

    runSteps([
      { kind: 'say', text: lead },
      { kind: 'card', cardType: 'profile', content: match.name, matchId: match.id },
      {
        kind: 'say',
        text: `You're both free ${shortSlot(match.proposedSlot)}. Book it?`,
      },
      { kind: 'reasons', matchId: match.id },
      { kind: 'prompt', prompt: 'proposal' },
    ]);
  };

  const book = (slot: Slot) => {
    const match = matches[matchIndexRef.current];
    runSteps([
      { kind: 'say', text: `Booked. ${formatSlot(slot)} with ${match.firstName}.` },
      { kind: 'card', cardType: 'success', content: 'Chat scheduled', matchId: match.id },
      { kind: 'wait', ms: 600 },
      { kind: 'divider', text: `After your chat · ${formatSlot(slot)}` },
      { kind: 'say', text: `How did it go with ${match.firstName}?` },
      { kind: 'prompt', prompt: 'reflection' },
    ]);
  };

  const handleAccept = () => {
    push({ type: 'user', content: 'Book it' });
    book(proposedSlot);
  };

  const handleReschedule = () => {
    setSelectedCalendarSlot(null);
    runSteps([
      {
        kind: 'say',
        text: `No problem. Here's everything ${matches[matchIndexRef.current].firstName} and you are both free for:`,
      },
      { kind: 'prompt', prompt: 'timeSlot' },
    ]);
  };

  const handleOtherPerson = () => {
    const nextIndex = matchIndexRef.current + 1;
    const next = matches[nextIndex];
    if (!next) {
      runSteps([
        {
          kind: 'say',
          text: `That's everyone free next week. ${matches[matchIndexRef.current].firstName} is still the strongest match. Want to go ahead?`,
        },
        { kind: 'prompt', prompt: 'proposal' },
      ]);
      return;
    }
    proposeMatch(next, nextIndex, `Sure. ${next.firstName} from ${next.team} is also open next week.`);
  };

  const handleTeamRequest = (team: string) => {
    const index = matches.findIndex(m => m.team === team);
    if (index === -1) {
      runSteps([
        { kind: 'say', text: `No one from ${team} has opted in for next week. I can widen the search for the week after, or stick with ${currentMatch.firstName}.` },
        { kind: 'prompt', prompt: 'proposal' },
      ]);
      return;
    }
    if (index === matchIndexRef.current) {
      runSteps([
        { kind: 'say', text: `${currentMatch.firstName} is already from ${team}, so you're in the right place.` },
        { kind: 'prompt', prompt: 'proposal' },
      ]);
      return;
    }
    proposeMatch(matches[index], index, `Got it, ${team} it is. ${matches[index].firstName} is free next week.`);
  };

  const handleModeChange = (mode: 'online' | 'in-person') => {
    setMeetingPreference(mode);
    const match = matches[matchIndexRef.current];
    runSteps([
      {
        kind: 'say',
        text:
          mode === 'in-person'
            ? `In person it is. ${match.firstName} is at ${match.location}, so I'll book a table at the ground-floor café.`
            : `Online it is. I'll drop a video link on the invite.`,
      },
      { kind: 'prompt', prompt: 'proposal' },
    ]);
  };

  const handleAbout = () => {
    const match = matches[matchIndexRef.current];
    runSteps([
      { kind: 'say', text: `${match.name}. ${match.role}, ${match.team}. ${match.bio}` },
      { kind: 'prompt', prompt: 'proposal' },
    ]);
  };

  const handleDecline = () => {
    runSteps([
      { kind: 'say', text: `No problem. I'll hold the slot until Sunday and check back then.` },
      { kind: 'prompt', prompt: 'idle' },
    ]);
  };

  const handleHistory = () => {
    runSteps([
      {
        kind: 'say',
        text: `You've had ${history.length} chats this quarter: ${history.map(c => c.name.split(' ')[0]).join(', ')}. The strip at the top has the details.`,
      },
      { kind: 'prompt', prompt: 'proposal' },
    ]);
  };

  const handleConfirmCalendarSlot = () => {
    if (!selectedCalendarSlot) return;
    push({ type: 'user', content: formatSlot(selectedCalendarSlot) });
    setProposedSlot(selectedCalendarSlot);
    book(selectedCalendarSlot);
  };

  const handleReflection = (option: (typeof reflectionOptions)[number]) => {
    const match = matches[matchIndexRef.current];
    push({ type: 'user', content: option.label });

    // Feedback actually lands somewhere: the chat joins the history strip
    setHistory(prev => [
      { id: match.id, name: match.name, initials: match.initials, date: `July ${proposedSlot.day}`, reaction: option.label.slice(0, 2).trim() },
      ...prev,
    ]);

    runSteps([
      { kind: 'say', text: option.note },
      { kind: 'prompt', prompt: 'idle' },
    ]);
  };

  const handleStartOver = () => {
    push({ type: 'user', content: 'Find me another chat' });
    const nextIndex = matches.findIndex(m => !seenMatchIds.includes(m.id));
    const index = nextIndex === -1 ? 0 : nextIndex;
    proposeMatch(matches[index], index, `On it. ${matches[index].firstName} from ${matches[index].team} is free next week.`);
  };

  // Data transparency on demand: same surfaces-when-asked pattern as the
  // mode switch. States only what the demo shows (source-cited reasons,
  // private reflections) and the product fiction's opt-in.
  const handlePrivacy = () => {
    runSteps([
      { kind: 'say', text: 'Fair question. I read your calendar free and busy times, your onboarding profile, shared Slack channels, the org chart, and team surveys. That is what the reasons under each proposal cite.' },
      { kind: 'say', text: `Your reflections stay between us, ${currentMatch.firstName} never sees them. They see the same kind of source-cited reasons about you. And Coffee Chat is opt in, you can leave anytime from your Litespace settings.` },
      { kind: 'prompt', prompt: currentPrompt ?? 'proposal' },
    ]);
  };

  // Typed messages drive the same transitions as the buttons
  const handleSendMessage = () => {
    const text = inputMessage.trim();
    if (!text || busy) return;

    push({ type: 'user', content: text });
    setInputMessage('');
    const intent = parseIntent(text);
    const booked = currentPrompt === 'reflection' || currentPrompt === 'idle';

    switch (intent.kind) {
      case 'accept':
        if (booked) {
          return runSteps([
            { kind: 'say', text: "That one's already on your calendar. Want me to line up another?" },
            { kind: 'prompt', prompt: 'idle' },
          ]);
        }
        return book(proposedSlot);
      case 'reschedule':
        return handleReschedule();
      case 'otherPerson':
        return handleOtherPerson();
      case 'team':
        return handleTeamRequest(intent.team!);
      case 'inPerson':
        return handleModeChange('in-person');
      case 'online':
        return handleModeChange('online');
      case 'about':
        return handleAbout();
      case 'privacy':
        return handlePrivacy();
      case 'history':
        return handleHistory();
      case 'decline':
        return handleDecline();
      default:
        // Be honest about the boundary instead of faking comprehension
        return runSteps([
          {
            kind: 'say',
            text: "I can't help with that one yet. I can book the chat, move it to another time, swap in someone else, switch to in person, or tell you more about your match.",
          },
          { kind: 'prompt', prompt: currentPrompt ?? 'proposal' },
        ]);
    }
  };

  const mutualSlots = currentMatch.mutualSlots;
  const isMutual = (day: number, hour: number) =>
    mutualSlots.some(slot => slot.day === day && slot.hour === hour);

  const primaryButton =
    'bg-[#635bff] h-[32px] px-[11px] py-[6px] rounded-[4px] flex items-center justify-center gap-[4px] hover:bg-[#5850e6] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635bff] focus-visible:ring-offset-2';
  const secondaryButton =
    'bg-white h-[32px] px-[11px] py-[6px] rounded-[4px] border border-[#d5dbe1] flex items-center justify-center gap-[4px] hover:bg-[#f6f8fa] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635bff] focus-visible:ring-offset-2';

  return (
    <div className="relative w-[500px] max-w-full h-[min(700px,100svh)] bg-white rounded-[8px] border border-[#d5dbe1] flex flex-col">
      {/* Header - Fixed */}
      <div className="bg-[#f6f8fa] h-[69px] rounded-t-[8px] border-b border-[#d5dbe1] flex items-center px-[21px] flex-shrink-0">
        <div className="flex items-center gap-[12px]">
          <div className="size-[30px] rounded-full bg-gradient-to-br from-[#7c75ff] to-[#635bff] flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C11.45 2 11 2.45 11 3V4H8C6.9 4 6 4.9 6 6V18C6 19.1 6.9 20 8 20H16C17.1 20 18 19.1 18 18V6C18 4.9 17.1 4 16 4H13V3C13 2.45 12.55 2 12 2ZM9 9H11V11H9V9ZM9 12H11V14H9V12ZM15 9V11H13V9H15ZM15 12V14H13V12H15ZM8 16V17H16V16H8Z"/>
            </svg>
          </div>
          <div>
            <p className="font-['Inter'] font-medium text-[16px] text-[#041c33] leading-normal">Luna</p>
            <p className="font-['Inter'] font-normal text-[14px] text-[#304050] leading-normal">Your Coffee Chat assistant</p>
          </div>
        </div>
      </div>

      {/* Messages Area - Scrollable */}
      <div ref={scrollerRef} className="flex-1 overflow-y-auto overscroll-contain p-[21px]">
        <div className="flex flex-col gap-[24px]">
          {/* Past chats */}
          <PastChats chats={history} />

          {/* Deadline */}
          <div className="flex gap-[12px] items-center">
            <div className="w-[16px] h-[16px] flex-shrink-0">
              <ErrorWarningLine1 />
            </div>
            <p className="font-['Inter'] font-normal text-[14px] text-[#041c33] leading-[18px]">Please schedule this chat by Sunday, July 19</p>
          </div>

          {/* Messages */}
          <div className="flex flex-col gap-[16px]" aria-live="polite">
            <AnimatePresence>
              {messages.map(message => {
                const match = matches.find(m => m.id === message.matchId);

                if (message.type === 'divider') {
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-[12px] py-[4px]"
                    >
                      <div className="h-px flex-1 bg-[#d5dbe1]" />
                      <p className="font-['Inter'] font-normal text-[12px] text-[#8792a2] leading-[18px]">
                        {message.content}
                      </p>
                      <div className="h-px flex-1 bg-[#d5dbe1]" />
                    </motion.div>
                  );
                }

                if (message.type === 'card' && message.cardType === 'profile' && match) {
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-[#d5dbe1] rounded-[8px] p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-[48px] rounded-full overflow-hidden flex-shrink-0">
                          {match.avatar ? (
                            <img src={match.avatar} alt={match.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#7c75ff] to-[#635bff] flex items-center justify-center">
                              <span className="font-['Inter'] font-medium text-[16px] text-white leading-normal">
                                {match.initials}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-['Inter'] font-medium text-[16px] text-[#041c33] leading-normal">{match.name}</p>
                          <p className="font-['Inter'] font-normal text-[14px] text-[#304050] leading-normal">{match.role}</p>
                          <p className="font-['Inter'] font-normal text-[12px] text-[#8792a2] leading-[18px]">{match.location}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                }

                if (message.type === 'suggestions' && match) {
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <SuggestionCards reasons={match.reasons} />
                    </motion.div>
                  );
                }

                if (message.type === 'card' && message.cardType === 'success') {
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center justify-center py-8 gap-4"
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
                      <p className="font-['Inter'] font-normal text-[14px] text-[#304050] text-center max-w-[280px]">
                        {meetingPreference === 'in-person'
                          ? `Invite sent to you and ${match?.firstName ?? 'your match'} with the café details`
                          : `Invite sent to you and ${match?.firstName ?? 'your match'} with a video link`}
                      </p>
                    </motion.div>
                  );
                }

                if (message.type === 'ai' || message.type === 'user') {
                  return <ChatMessage key={message.id} message={{ ...message, type: message.type }} />;
                }
                return null;
              })}
            </AnimatePresence>

            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-3"
              >
                <AIAgent isTyping={true} />
                <div className="bg-[#f6f8fa] rounded-[8px] px-4 py-3 border border-[#d5dbe1]">
                  <div className="flex gap-1">
                    {[0, 0.2, 0.4].map(delay => (
                      <motion.span
                        key={delay}
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay }}
                        className="w-2 h-2 bg-[#635bff] rounded-full"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Proposal prompt */}
          {!busy && currentPrompt === 'proposal' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-[12px]"
            >
              <button onClick={handleAccept} className={primaryButton}>
                <p className="font-['Inter'] font-medium text-[14px] text-white leading-[20px]">
                  Book {shortSlot(proposedSlot)}
                </p>
              </button>
              <button
                onClick={() => {
                  push({ type: 'user', content: 'Pick another time' });
                  handleReschedule();
                }}
                className={secondaryButton}
              >
                <p className="font-['Inter'] font-medium text-[14px] text-[#8792a2] leading-[20px]">Pick another time</p>
              </button>
              <button
                onClick={() => {
                  push({ type: 'user', content: 'Someone else' });
                  handleOtherPerson();
                }}
                className={secondaryButton}
              >
                <p className="font-['Inter'] font-medium text-[14px] text-[#8792a2] leading-[20px]">Someone else</p>
              </button>
            </motion.div>
          )}

          {/* Calendar prompt */}
          {!busy && currentPrompt === 'timeSlot' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-[16px]"
            >
              <div>
                <p className="font-['Inter'] font-normal text-[16px] text-[#041c33] leading-normal mb-[12px]">
                  Select a time that works for both of you
                </p>

                <div className="grid grid-cols-[60px_repeat(5,1fr)] gap-[1px] mb-[1px]">
                  <div className="h-[50px]"></div>
                  {days.map(day => (
                    <div key={day.date} className="text-center">
                      <p className="font-['Inter'] font-medium text-[12px] text-[#8792a2] uppercase leading-normal">
                        {day.name}
                      </p>
                      <p className="font-['Inter'] font-normal text-[16px] text-[#041c33] leading-normal">
                        {day.date}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border border-[#d5dbe1] rounded-[4px] overflow-hidden">
                  {hours.map(hour => (
                    <div key={hour} className="grid grid-cols-[60px_repeat(5,1fr)] gap-[1px] bg-[#d5dbe1]">
                      <div className="h-[44px] flex items-center justify-start px-[8px] bg-white">
                        <p className="font-['Inter'] font-normal text-[12px] text-[#8792a2] leading-normal">
                          {formatTime(hour)}
                        </p>
                      </div>

                      {days.map(day => {
                        const available = isMutual(day.date, hour);
                        const isSelected =
                          selectedCalendarSlot?.day === day.date && selectedCalendarSlot?.hour === hour;

                        return (
                          <button
                            key={`${day.date}-${hour}`}
                            onClick={() => available && setSelectedCalendarSlot({ day: day.date, hour })}
                            disabled={!available}
                            aria-pressed={isSelected}
                            aria-label={
                              available
                                ? `${day.full} July ${day.date} at ${formatTime(hour)}, both available`
                                : `${day.full} July ${day.date} at ${formatTime(hour)}, unavailable`
                            }
                            title={available ? 'Both available' : `${currentMatch.firstName} or you are busy`}
                            className={`h-[44px] transition-all relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#635bff] ${
                              available
                                ? isSelected
                                  ? 'bg-[#635bff] cursor-pointer hover:bg-[#5850e6]'
                                  : 'bg-[#9BE8C5] cursor-pointer hover:bg-[#7dd9b3]'
                                : 'bg-white cursor-not-allowed'
                            }`}
                          >
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute inset-0 flex items-center justify-center"
                              >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
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

                <div className="flex items-center gap-[16px] mt-[12px]">
                  <div className="flex items-center gap-[8px]">
                    <div className="w-[20px] h-[20px] bg-[#9BE8C5] rounded-[2px]"></div>
                    <span className="font-['Inter'] font-normal text-[12px] text-[#304050] leading-normal">
                      Both available
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleConfirmCalendarSlot}
                disabled={!selectedCalendarSlot}
                className={`w-full h-[32px] px-[11px] py-[6px] rounded-[4px] flex items-center justify-center gap-[4px] transition-colors ${
                  selectedCalendarSlot
                    ? 'bg-[#635bff] hover:bg-[#5850e6] cursor-pointer'
                    : 'bg-[#d5dbe1] cursor-not-allowed'
                }`}
              >
                <p className="font-['Inter'] font-medium text-[14px] text-white leading-[20px]">Confirm time</p>
              </button>

              <button onClick={() => setShowManualInput(true)} className={secondaryButton}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <path d="M12 5V19M5 12H19" stroke="#8792a2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="font-['Inter'] font-medium text-[14px] text-[#8792a2] leading-[20px]">
                  Add availability manually
                </p>
              </button>
            </motion.div>
          )}

          {/* Reflection prompt */}
          {!busy && currentPrompt === 'reflection' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-[12px]"
            >
              {reflectionOptions.map((option, index) => (
                <motion.button
                  key={option.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleReflection(option)}
                  className={secondaryButton}
                >
                  <p className="font-['Inter'] font-medium text-[14px] text-[#8792a2] leading-[20px]">{option.label}</p>
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Idle */}
          {!busy && currentPrompt === 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-[12px]"
            >
              <button onClick={handleStartOver} className={primaryButton}>
                <p className="font-['Inter'] font-medium text-[14px] text-white leading-[20px]">Find me another chat</p>
              </button>
            </motion.div>
          )}

        </div>
      </div>

      {/* Manual Input Dialog */}
      {showManualInput && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 rounded-[8px]"
          onClick={() => setShowManualInput(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-label="Add your availability"
            className="bg-white rounded-[8px] border border-[#d5dbe1] p-[21px] w-[360px] max-w-[calc(100%-32px)]"
          >
            <div className="flex flex-col gap-[20px]">
              <div>
                <p className="font-['Inter'] font-medium text-[16px] text-[#041c33] leading-normal mb-1">
                  Add your availability
                </p>
                <p className="font-['Inter'] font-normal text-[12px] text-[#304050] leading-normal">
                  Enter a time that works for you
                </p>
              </div>

              <div className="flex flex-col gap-[8px]">
                <label htmlFor="manual-date" className="font-['Inter'] font-medium text-[12px] text-[#041c33] leading-normal">
                  Date
                </label>
                <input
                  id="manual-date"
                  type="date"
                  value={manualDate}
                  onChange={e => setManualDate(e.target.value)}
                  className="h-[32px] px-3 py-2 rounded-[4px] border border-[#d5dbe1] font-['Inter'] font-normal text-[14px] text-[#041c33] leading-[20px] focus:outline-none focus:border-[#635bff]"
                />
              </div>

              <div className="flex flex-col gap-[8px]">
                <label htmlFor="manual-time" className="font-['Inter'] font-medium text-[12px] text-[#041c33] leading-normal">
                  Time
                </label>
                <input
                  id="manual-time"
                  type="time"
                  value={manualTime}
                  onChange={e => setManualTime(e.target.value)}
                  className="h-[32px] px-3 py-2 rounded-[4px] border border-[#d5dbe1] font-['Inter'] font-normal text-[14px] text-[#041c33] leading-[20px] focus:outline-none focus:border-[#635bff]"
                />
              </div>

              <div className="flex flex-col gap-[12px]">
                <button
                  disabled={!manualDate || !manualTime}
                  onClick={() => {
                    setShowManualInput(false);
                    const hour = Number(manualTime.split(':')[0]);
                    const day = Number(manualDate.split('-')[2]);
                    setManualDate('');
                    setManualTime('');
                    runSteps([
                      {
                        kind: 'say',
                        text: `Thanks. I've added July ${day} at ${formatTime(hour)} to your availability and asked ${currentMatch.firstName} to confirm.`,
                      },
                      { kind: 'prompt', prompt: 'timeSlot' },
                    ]);
                  }}
                  className={`h-[32px] px-[11px] py-[6px] rounded-[4px] flex items-center justify-center gap-[4px] transition-colors ${
                    manualDate && manualTime
                      ? 'bg-[#635bff] hover:bg-[#5850e6] cursor-pointer'
                      : 'bg-[#d5dbe1] cursor-not-allowed'
                  }`}
                >
                  <p className="font-['Inter'] font-medium text-[14px] text-white leading-[20px]">Submit availability</p>
                </button>
                <button onClick={() => setShowManualInput(false)} className={secondaryButton}>
                  <p className="font-['Inter'] font-medium text-[14px] text-[#8792a2] leading-[20px]">Cancel</p>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Input Area - Fixed at Bottom */}
      <div className="border-t border-[#d5dbe1] p-[16px] flex-shrink-0">
        <div className="flex gap-[8px] items-center">
          <label htmlFor="chat-input" className="sr-only">Message Luna</label>
          <input
            id="chat-input"
            type="text"
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask Luna, or type what you'd rather do..."
            className="flex-1 h-[40px] px-[12px] rounded-[4px] border border-[#d5dbe1] font-['Inter'] font-normal text-[14px] text-[#041c33] leading-[20px] focus:outline-none focus:border-[#635bff] placeholder:text-[#8792a2]"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || busy}
            aria-label="Send message"
            className={`h-[40px] w-[40px] rounded-[4px] flex items-center justify-center transition-colors flex-shrink-0 ${
              inputMessage.trim() && !busy
                ? 'bg-[#635bff] hover:bg-[#5850e6] cursor-pointer'
                : 'bg-[#d5dbe1] cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
