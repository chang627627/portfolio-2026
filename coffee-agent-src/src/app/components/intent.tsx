import { matches } from './matchData';

export type IntentKind =
  | 'accept'
  | 'decline'
  | 'otherPerson'
  | 'team'
  | 'reschedule'
  | 'inPerson'
  | 'online'
  | 'about'
  | 'privacy'
  | 'history'
  | 'unknown';

export interface Intent {
  kind: IntentKind;
  /** Team name when kind is 'team' */
  team?: string;
}

const has = (text: string, phrases: string[]) => phrases.some(p => text.includes(p));

const teams = Array.from(new Set(matches.map(m => m.team)));

/**
 * Lightweight intent matcher. Typed messages drive the same state transitions
 * as the prompt buttons, so the buttons are shortcuts rather than the only path.
 */
export function parseIntent(raw: string): Intent {
  const text = raw.toLowerCase().trim();

  // Team requests are checked first — "someone from engineering" is more
  // specific than the generic "someone else"
  const team = teams.find(t => text.includes(t.toLowerCase()));
  const teamAlias = text.includes('engineer') || text.includes('dev')
    ? 'Engineering'
    : text.includes('design')
      ? 'Product Design'
      : text.includes('content') || text.includes('writer')
        ? 'Content'
        : undefined;
  if (team || (teamAlias && has(text, ['someone', 'somebody', 'anyone', 'match', 'meet', 'from', 'rather', 'instead', 'prefer']))) {
    return { kind: 'team', team: team ?? teamAlias };
  }

  if (has(text, ['in person', 'in-person', 'irl', 'face to face', 'coffee shop', 'cafe', 'office'])) {
    return { kind: 'inPerson' };
  }
  if (has(text, ['online', 'video', 'remote', 'zoom', 'call', 'virtual'])) {
    return { kind: 'online' };
  }
  if (has(text, ['another time', 'different time', 'other time', 'reschedule', 'move it', 'another slot', 'different day', 'other day', "doesn't work", 'does not work', 'cant make', "can't make", 'busy then', 'pick a time', 'change the time'])) {
    return { kind: 'reschedule' };
  }
  if (has(text, ['someone else', 'somebody else', 'another person', 'different person', 'not them', 'someone different', 'next person', 'anyone else'])) {
    return { kind: 'otherPerson' };
  }
  if (has(text, ['know about me', 'my data', 'my information', 'privacy', 'consent', 'what can you see', 'where did you get', 'data do you', 'tracking', 'creepy', 'spying'])) {
    return { kind: 'privacy' };
  }
  if (has(text, ['who is', 'tell me more', 'more about', 'what do they do', 'what does', 'why them', 'why this', 'why did you', 'their role', 'background'])) {
    return { kind: 'about' };
  }
  if (has(text, ['past chat', 'previous chat', 'who have i met', 'history', 'last time', 'earlier chats'])) {
    return { kind: 'history' };
  }
  if (has(text, ['not now', 'maybe later', 'later', 'skip', 'no thanks', 'not this week', 'pass', 'cancel'])) {
    return { kind: 'decline' };
  }
  if (has(text, ['yes', 'yeah', 'yep', 'sure', 'sounds good', 'sounds great', 'book it', 'lets do', "let's do", 'go ahead', 'confirm', 'works for me', 'perfect', 'ok', 'okay', 'do it'])) {
    return { kind: 'accept' };
  }

  return { kind: 'unknown' };
}
