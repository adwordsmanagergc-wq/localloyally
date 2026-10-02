/** Customer groups used by the dashboard and by offers. Visits = purchase stamp rows. */
export const SEGMENTS = {
  all: { label: 'Everyone', hint: 'All members' },
  active: { label: 'Active', hint: 'Visited in the last 30 days' },
  regulars: { label: 'Regulars', hint: '3+ visits in the last 60 days' },
  close: { label: 'Close to a reward', hint: '1 or 2 stamps away from their next reward' },
  at_risk: { label: 'At risk', hint: 'Last visit 31 to 60 days ago' },
  lost: { label: 'Lost', hint: 'No visit in over 60 days' },
  never: { label: 'Joined, never visited', hint: 'Signed up but no visit yet' },
} as const;
export type Segment = keyof typeof SEGMENTS;
export const isSegment = (s: unknown): s is Segment => typeof s === 'string' && s in SEGMENTS;
