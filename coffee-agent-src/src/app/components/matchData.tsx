import imgGroup202 from "figma:asset/d56aaa0b5b0d6767c6dae1e50d0d43d6a7767346.png";

export interface Reason {
  text: string;
  /** Where Luna got this from — shown so the reasoning is inspectable */
  source: string;
}

export interface Slot {
  day: number;
  hour: number;
}

export interface Match {
  id: string;
  name: string;
  firstName: string;
  role: string;
  team: string;
  location: string;
  avatar?: string;
  initials: string;
  bio: string;
  reasons: Reason[];
  /** Slots where both Kevin and this person are free */
  mutualSlots: Slot[];
  /** Luna's opening recommendation */
  proposedSlot: Slot;
}

export const matches: Match[] = [
  {
    id: 'ella',
    name: 'Ella Kim',
    firstName: 'Ella',
    role: 'Product Designer',
    team: 'Product Design',
    location: 'Seoul office · 3rd floor',
    avatar: imgGroup202,
    initials: 'EK',
    bio: "Ella has been at Litespace for two years and leads design on the onboarding surface. She runs the monthly design critique.",
    reasons: [
      {
        text: 'You both worked on the Q3 brand sprint',
        source: 'Shared project · Q3 Brand Sprint',
      },
      {
        text: "Ella's user research feeds the campaigns your team ships",
        source: 'Org graph · Marketing ↔ Product Design',
      },
      {
        text: 'You have overlapped in #design-systems for four months',
        source: 'Shared channel · #design-systems',
      },
    ],
    mutualSlots: [
      { day: 21, hour: 10 },
      { day: 22, hour: 10 },
      { day: 22, hour: 11 },
      { day: 22, hour: 17 },
      { day: 23, hour: 11 },
      { day: 23, hour: 14 },
      { day: 23, hour: 15 },
      { day: 24, hour: 10 },
      { day: 24, hour: 11 },
      { day: 24, hour: 17 },
      { day: 24, hour: 18 },
      { day: 25, hour: 11 },
      { day: 25, hour: 12 },
      { day: 25, hour: 14 },
      { day: 25, hour: 17 },
    ],
    proposedSlot: { day: 22, hour: 11 },
  },
  {
    id: 'jordan',
    name: 'Jordan Reyes',
    firstName: 'Jordan',
    role: 'Software Engineer',
    team: 'Engineering',
    location: 'Remote · GMT+9',
    initials: 'JR',
    bio: "Jordan works on the scheduling service and has been asking for more context on how campaigns drive signups.",
    reasons: [
      {
        text: 'Jordan asked for a marketing partner in the last team survey',
        source: 'Engineering team survey · July',
      },
      {
        text: 'You both joined within a month of each other',
        source: 'Directory · start dates',
      },
      {
        text: 'Jordan ships the features your launches announce',
        source: 'Org graph · Marketing ↔ Engineering',
      },
    ],
    mutualSlots: [
      { day: 21, hour: 14 },
      { day: 22, hour: 15 },
      { day: 23, hour: 10 },
      { day: 23, hour: 16 },
      { day: 24, hour: 14 },
      { day: 24, hour: 15 },
      { day: 25, hour: 10 },
      { day: 25, hour: 16 },
    ],
    proposedSlot: { day: 23, hour: 10 },
  },
  {
    id: 'priya',
    name: 'Priya Nair',
    firstName: 'Priya',
    role: 'Content Strategist',
    team: 'Content',
    location: 'Seoul office · 5th floor',
    initials: 'PN',
    bio: "Priya is rewriting the product messaging guide and is looking for input from people who use it daily.",
    reasons: [
      {
        text: 'Priya is drafting the messaging guide your campaigns will use',
        source: 'Shared doc · Brand Voice v2',
      },
      {
        text: 'You both attended the customer research readout',
        source: 'Calendar · Research Readout, June 30',
      },
      {
        text: 'You have never met despite sitting two floors apart',
        source: 'Directory · Seoul office',
      },
    ],
    mutualSlots: [
      { day: 21, hour: 11 },
      { day: 21, hour: 16 },
      { day: 22, hour: 14 },
      { day: 23, hour: 17 },
      { day: 24, hour: 9 },
      { day: 24, hour: 16 },
      { day: 25, hour: 15 },
    ],
    proposedSlot: { day: 21, hour: 11 },
  },
];

export interface PastChat {
  id: string;
  name: string;
  initials: string;
  date: string;
  reaction: string;
}

export const pastChats: PastChat[] = [
  { id: 'p1', name: 'Marcus Bell', initials: 'MB', date: 'July 8', reaction: '😊' },
  { id: 'p2', name: 'Sofia Duarte', initials: 'SD', date: 'June 24', reaction: '💡' },
  { id: 'p3', name: 'Tom Whitfield', initials: 'TW', date: 'June 10', reaction: '😐' },
];

export const days = [
  { name: 'MON', full: 'Monday', date: 21 },
  { name: 'TUE', full: 'Tuesday', date: 22 },
  { name: 'WED', full: 'Wednesday', date: 23 },
  { name: 'THU', full: 'Thursday', date: 24 },
  { name: 'FRI', full: 'Friday', date: 25 },
];

export const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

export const formatTime = (hour: number) => {
  if (hour === 12) return '12 PM';
  if (hour > 12) return `${hour - 12} PM`;
  return `${hour} AM`;
};

export const formatSlot = (slot: Slot) => {
  const day = days.find(d => d.date === slot.day);
  return `${day?.full}, July ${slot.day} at ${formatTime(slot.hour)}`;
};

export const shortSlot = (slot: Slot) => {
  const day = days.find(d => d.date === slot.day);
  return `${day?.full} at ${formatTime(slot.hour)}`;
};
