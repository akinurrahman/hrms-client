import type { DemoAccount } from './landing.types';

export const LANDING_KEYS = {
  all: ['landing'] as const,
  health: () => [...LANDING_KEYS.all, 'health'] as const,
};

/** Shared demo password. The environment is public, seeded, and wiped daily
 *  by a cron, so these are display copy, not secrets. */
export const DEMO_PASSWORD = 'DemoPass123!';

/** Both zones spelled out, since the audience is split across them. */
export const RESET_SCHEDULE = 'daily / 22:30 UTC · 04:00 IST';

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'SITE_ADMIN',
    email: 'admin@example.com',
    blurb: 'Full run of the site: employees, rosters, approvals, holidays.',
  },
  {
    role: 'EMPLOYEE',
    email: 'employee@example.com',
    blurb: 'A single seat: own profile, own attendance, own leave.',
  },
];

/** Placeholder until the walkthrough recording is uploaded. Embedding is off on
 *  plenty of videos, so a stand-in has to be one that is known to allow it. */
export const WALKTHROUGH_VIDEO_ID = "Cmr7H4OKkLs";


/** Render free tier sleeps after inactivity, so a cold start can take most of a
 *  minute. Retries stretch out rather than give up inside that window. */
export const HEALTH_RETRY_COUNT = 4;
export const HEALTH_STALE_TIME = 5 * 60 * 1000;
