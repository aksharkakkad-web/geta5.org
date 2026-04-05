# Auth & Freemium System Design

**Date:** 2026-04-04
**Status:** Approved
**Approach:** Supabase Auth + API Routes (Approach A)

## Overview

Add user authentication (Google OAuth + email/password) via Supabase Auth, a freemium gate (5 free questions then hard signup wall), localStorage-to-Supabase data migration for authenticated users, and admin dashboard user management.

## 1. Auth Infrastructure

### New Package
- `@supabase/ssr` — Next.js cookie-based auth session management

### Supabase Dashboard Setup (Manual)
- Enable Google OAuth provider (requires Google Cloud Console OAuth credentials)
- Enable email/password provider (already available in Supabase by default)
- Add redirect URLs: `https://geta5.app/auth/callback` and `http://localhost:3000/auth/callback`

### New Files

**`lib/supabase-browser.ts`** — Client-side Supabase client using `@supabase/ssr` `createBrowserClient()`. Used for auth operations only (signIn, signUp, signOut, onAuthStateChange). Data read/writes still go through API routes.

**`lib/supabase-server.ts`** — Server-side Supabase client using `@supabase/ssr` `createServerClient()`. Used in API routes and middleware. Reads cookies from the request to get the current session.

**`middleware.ts`** (project root) — Refreshes the Supabase auth session on every request by calling `supabase.auth.getUser()`. This keeps the cookie-based session alive. Does NOT block any routes — freemium gating is handled client-side.

### Existing File Changes
- `lib/supabase.ts` — Keep as-is for anonymous analytics. Auth uses the new `supabase-browser.ts` / `supabase-server.ts` clients.

## 2. Database Schema

Three new tables in Supabase, all with RLS enabled but accessed exclusively through API routes (RLS is defense-in-depth, not the primary access control).

```sql
-- Extends auth.users with app-specific profile data
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Replaces localStorage mastery keys for authenticated users
-- One row per user per subject-unit combination
create table public.user_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  subject text not null,
  unit text not null,
  drill_accuracy float default 0,
  mcq_accuracy float default 0,
  total_attempts int default 0,
  updated_at timestamptz default now(),
  unique(user_id, subject, unit)
);

-- Replaces localStorage streak/score/total_questions keys
create table public.user_stats (
  user_id uuid references public.profiles on delete cascade primary key,
  total_questions int default 0,
  streak_count int default 0,
  streak_last_date text,
  updated_at timestamptz default now()
);

-- RLS policies (defense-in-depth — API routes are primary access control)
alter table public.profiles enable row level security;
alter table public.user_progress enable row level security;
alter table public.user_stats enable row level security;

create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can read own progress" on public.user_progress for select using (auth.uid() = user_id);
create policy "Users can upsert own progress" on public.user_progress for insert with check (auth.uid() = user_id);
create policy "Users can update own progress" on public.user_progress for update using (auth.uid() = user_id);
create policy "Users can read own stats" on public.user_stats for select using (auth.uid() = user_id);
create policy "Users can upsert own stats" on public.user_stats for insert with check (auth.uid() = user_id);
create policy "Users can update own stats" on public.user_stats for update using (auth.uid() = user_id);

-- Auto-create profile on signup via database trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  insert into public.user_stats (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

## 3. Auth Context & Provider

**`contexts/AuthContext.tsx`** — React context that wraps the app in `layout.tsx`.

```
AuthProvider
  - Subscribes to supabase.auth.onAuthStateChange()
  - Exposes: { user, session, isLoading, isAuthenticated }
  - On sign-in: triggers data migration (Section 6)
  - On sign-out: clears Supabase-synced state, keeps localStorage
```

**`app/layout.tsx`** — Wraps `<main>` with `<AuthProvider>`.

## 4. Signup Page

**Route:** `app/signup/page.tsx`

**Behavior:**
- Accepts `?redirect=` query param (the page the user was on before being redirected)
- Default mode: signup. Toggle link at bottom: "Already have an account? Log in"
- Login mode: email + password fields + "Forgot password?" link
- Signup mode: email + password fields
- Google OAuth button prominent at top in both modes
- On successful auth: redirect to the `redirect` query param value, or `/` if none

**OAuth Callback:** `app/auth/callback/route.ts`
- Handles the OAuth redirect from Google
- Exchanges the code for a session using `supabase.auth.exchangeCodeForSession()`
- Redirects to the `redirect` param stored in the original `/signup` URL (passed via state or cookie)

**Password Reset:** `app/auth/reset-password/page.tsx`
- Email input → calls `supabase.auth.resetPasswordForEmail()`
- Confirmation message shown
- Password update page at `app/auth/update-password/page.tsx` (linked from Supabase reset email)

## 5. Freemium Gate

**How it works:**
- `ascendly_total_questions` in localStorage is the counter (already exists and is incremented by drillSession, mcqSession, testSession)
- The gate checks this counter BEFORE a question session starts
- Study guide views do NOT count toward the limit

**Gate check — `utils/freeTrialGate.ts`:**
```typescript
const FREE_QUESTION_LIMIT = 5

export function shouldBlockAccess(): boolean {
  const total = lsGet<number>(LS_KEYS.totalQuestions, 0)
  return total >= FREE_QUESTION_LIMIT
}
```

**Integration points:**
- `app/[subject]/drills/page.tsx` — check on mount. If `shouldBlockAccess()` && not authenticated → redirect to `/signup?redirect={currentPath}`
- `app/[subject]/practice/page.tsx` — same check
- `app/[subject]/practice-test/page.tsx` — same check
- `app/[subject]/study-guide/page.tsx` — NO gate (passive reading, always free)

**UX flow:**
1. Anonymous user opens site, starts practicing
2. After completing 5 questions (across any combination of drills/MCQs/tests), the counter hits 5
3. Next time they navigate to any question page, they're redirected to `/signup?redirect=...`
4. They sign up → redirected back to where they were → unlimited access

**Why client-side gating, not middleware:** The counter lives in localStorage. Middleware can't read localStorage. Middleware only handles session refresh.

## 6. Data Migration (localStorage to Supabase)

**Trigger:** First successful sign-in (detected in AuthContext when `onAuthStateChange` fires `SIGNED_IN` and user has no existing `user_stats` row).

**`utils/dataMigration.ts`:**
1. Read all `ascendly_mastery_*` keys from localStorage
2. Read `ascendly_streak`, `ascendly_total_questions`, `ascendly_score_*`
3. POST to `/api/user/migrate` with the full payload
4. API route writes to `user_progress` and `user_stats` tables
5. On success: set `ascendly_migrated` flag in localStorage to prevent re-migration

**Conflict resolution:** If the user already has Supabase data (e.g., signed up on another device), the migration merges by taking the HIGHER value for each field (max of local vs remote accuracy, sum of attempts, etc.).

## 7. Dual-Write Persistence Layer

**For authenticated users, every session completion writes to BOTH localStorage AND Supabase.**

**`utils/persistence.ts`:**
```typescript
export async function saveProgress(subject: string, unit: string, data: MasteryData): Promise<void> {
  // Always write to localStorage first (instant UI)
  lsSet(LS_KEYS.mastery(subject, unit), data)

  // If authenticated, also fire-and-forget to Supabase
  if (isAuthenticated()) {
    fetch('/api/user/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, unit, ...data }),
    }).catch(() => {}) // Never block UI
  }
}
```

**Integration:** Modify `utils/drillSession.ts`, `utils/mcqSession.ts`, `utils/testSession.ts` to call `saveProgress()` and `saveStats()` instead of direct `lsSet` calls for mastery/score/streak data. The `totalQuestions` increment also goes through `saveStats()`.

**On page load (authenticated users):** Fetch from Supabase and hydrate localStorage. This ensures cross-device sync. Done in AuthContext after sign-in.

## 8. API Routes

New API routes (all server-side, using `lib/supabase-server.ts`):

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/user/migrate` | POST | One-time localStorage → Supabase migration |
| `/api/user/progress` | POST | Upsert user_progress row after session completion |
| `/api/user/stats` | POST | Update user_stats (total_questions, streak) |
| `/api/user/sync` | GET | Fetch all user data for localStorage hydration |
| `/api/admin/users` | GET | List all users with stats (admin dashboard) |
| `/api/admin/user/[id]` | GET | Per-user detail with progress breakdown (admin dashboard) |

All routes verify the session from cookies. Admin routes additionally check against a hardcoded admin user ID list (or a Supabase `is_admin` flag on profiles).

## 9. Header Updates

**When anonymous:**
- No visible change to the header. The freemium gate handles redirection.

**When authenticated:**
- Right side of header: user's display name or email (truncated) + sign out button
- Clicking display name could expand to a minimal dropdown (sign out only — no settings page)

## 10. Admin Dashboard Enhancement

**Existing:** Password-protected analytics dashboard at `/admin`.

**New additions:**
- **Users tab:** Table of all registered users (email, signup date, total questions, last active)
- **User detail view:** Click a user → see their per-subject progress, drill/MCQ/test accuracy, streak history
- **Stats cards:** Total registered users, users active today/this week, conversion rate (signups / total visitors)

**Auth for admin:** Keep existing password auth for now. Future enhancement: check Supabase `is_admin` flag.

## 11. Marketing Copy Updates

Current homepage says "No signup, no paywall, completely free." This needs to change to reflect the freemium model:
- "Free to try. Sign up to unlock unlimited practice."
- Update `metadata` in `layout.tsx` and OG tags accordingly

## 12. Analytics Enhancement

For authenticated users, include `user_id` (from Supabase auth) in analytics events instead of `anon_id`. This lets us correlate pre-signup anonymous usage with post-signup authenticated usage.

Modify `utils/analytics.ts`:
- If authenticated, include `user_id` in metadata
- Keep `anon_id` as fallback for anonymous users
- Include both during the transition (user was anonymous, now authenticated)

## Out of Scope
- Email verification (can add later, too much friction now)
- Social features / user profiles visible to others
- Password strength requirements beyond Supabase defaults
- Rate limiting on auth endpoints (Supabase handles this)
- Light mode
- Dedicated settings/profile page
