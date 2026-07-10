## Root cause

Signup fails at "new row violates row-level security policy for table 'organizations'" because when email confirmation is on, `supabase.auth.signUp()` does NOT return an authenticated session. The follow-up `insert` into `organizations` from the client then runs as the `anon` role, and every INSERT policy on `organizations` / `user_roles` requires `authenticated`. Even with confirmation off, there's a brief window where the client hasn't attached the JWT yet, so this pattern is fragile.

The fix is to stop inserting org + role from the client and instead provision everything server-side inside a `SECURITY DEFINER` trigger on `auth.users`, driven by data passed through `options.data` at signup. That is the only path that reliably bypasses RLS at the exact moment the user is created.

## Plan

### 1. Migration: expand `handle_new_user` to provision org + role

Replace the existing `handle_new_user()` so that, in addition to inserting the profile, it:

- Reads org fields from `NEW.raw_user_meta_data` (`organization_name`, `organization_type`, `dsp_number`, `permit_number`, `ein`, `address`, `city`, `state`, `zip_code`, `phone`, `role`).
- Inserts a row into `public.organizations`, capturing the new `id`.
- Inserts a row into `public.user_roles` linking the new `user_id`, `organization_id`, and `role` (defaulting to `admin` when missing — first user of a new org).
- Wrapped in `SECURITY DEFINER` with `SET search_path = public`, so RLS is bypassed only for this trusted path.

Attach it as a trigger on `auth.users AFTER INSERT` (drop-and-recreate to make sure it's actually installed — the current DB shows no triggers on `auth.users`, which is why nothing was auto-creating profiles either).

### 2. Auth config: allow immediate sign-in

Turn on auto-confirm email via `configure_auth` so a new user gets a session right after signup and can reach `/dashboard` without the confirmation round-trip. (Sign-ups stay enabled, anonymous stays off, HIBP stays off unless you want it.)

### 3. Client cleanup — `SupabaseAuthContext.signUp`

- Pass every signup field through `options.data` (so the trigger sees them in `raw_user_meta_data`).
- Remove the two client-side inserts into `organizations` and `user_roles` — the trigger owns that now.
- After `signUp` returns, if `authData.session` exists, the existing `onAuthStateChange` listener will hydrate `user` and the guard will let the app route to `/dashboard`.

### 4. Client cleanup — `SupabaseAuthContext.loadUserData`

Small robustness fix so the guard doesn't get stuck on "Setting up your account…" when the trigger is still writing rows: if `profile` or `userRole` comes back null, retry once after ~400ms before giving up. No schema change, just resilience.

### 5. Verify

Playwright: open `/auth`, submit the signup form with a fresh email, confirm redirect to `/dashboard`, then sign out and sign back in. Screenshot each step and check console/network for RLS errors.

## Technical notes

- Keeping the existing RLS policies as-is is correct — the trigger runs as definer and doesn't need policy changes.
- `handle_new_user` uses `ON CONFLICT (id) DO NOTHING` on profiles today; org insert has no natural conflict key, and roles use `(user_id, role)` unique — safe on retry.
- No edits to `src/integrations/supabase/client.ts` or `types.ts` (auto-generated).

## Files touched

- New migration: replace `handle_new_user`, ensure trigger on `auth.users`.
- `supabase--configure_auth`: `auto_confirm_email: true`.
- `src/contexts/SupabaseAuthContext.tsx`: simplify `signUp`, harden `loadUserData`.