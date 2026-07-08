
## Problem

`src/integrations/supabase/types.ts` currently declares `Tables: { [_ in never]: never }` because the database has no tables. That file is auto-generated from the live schema and cannot be hand-edited — every `supabase.from('profiles' | 'organizations' | 'user_roles')` call in `SupabaseAuthContext.tsx` therefore resolves to `never`.

The only way to give those queries real types is to create the tables in the database. Regeneration then happens automatically and `types.ts` will expose `profiles`, `organizations`, and `user_roles` row/insert/update types.

## Plan

Run one migration that creates the three tables the auth context already expects, with correct grants, RLS, and a `has_role` security-definer function to avoid the recursive-policy error from earlier.

### Schema

- `public.app_role` enum: `admin | production | accounting`
- `public.org_type` enum: `distillery | winery | brewery`
- `public.organizations`
  - `name text not null`, `type org_type not null`
  - `dsp_number, permit_number, ein, address, city, state, zip_code, phone` (all nullable text)
  - standard `id / created_at / updated_at`
- `public.profiles`
  - `id uuid pk references auth.users on delete cascade`
  - `first_name text`, `last_name text`, `email text not null`
- `public.user_roles`
  - `user_id uuid not null references auth.users on delete cascade`
  - `organization_id uuid not null references public.organizations on delete cascade`
  - `role app_role not null`
  - unique `(user_id, role)`

### Security

- Enable RLS on all three tables with grants for `authenticated` (+ `service_role`); no `anon`.
- `public.has_role(_user_id uuid, _role app_role) returns boolean` — `security definer`, `set search_path = public` — to break the recursion loop the user hit before.
- Policies:
  - `profiles`: user can select/update their own row (`id = auth.uid()`); insert own row.
  - `organizations`: members can select their org (`exists(select 1 from user_roles where user_id = auth.uid() and organization_id = organizations.id)`); admins can update via `has_role(auth.uid(), 'admin')`; any authenticated user can insert (needed for signup).
  - `user_roles`: user can select their own rows; user can insert their own row on signup (`user_id = auth.uid()`); admins can manage via `has_role`.

### Signup wiring

- `handle_new_user()` trigger on `auth.users` inserts a matching `profiles` row using `raw_user_meta_data->>'first_name' / 'last_name'` and `email`. This removes the "no profile found" path in `loadUserData`.
- `update_updated_at_column()` trigger on `organizations`.

### After the migration runs

Types regenerate automatically. No code edits are required for typing — `supabase.from('profiles')`, `.from('organizations')`, `.from('user_roles')` in `SupabaseAuthContext.tsx` will type-check with real row shapes instead of `never`.

Small follow-up code cleanup (only if you want it in the same turn after types regen):
- Drop the `as Organization` / `as 'admin' | ...` casts in `loadUserData` now that the compiler knows the shapes.
- Remove the inline `Profile / Organization / UserRole` interfaces in favor of `Tables<'profiles'>` etc.

Let me know if you'd like the follow-up cleanup applied after the migration, or migration only.
