ALTER TABLE public.team_invites
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'equipe',
  ADD COLUMN IF NOT EXISTS departments jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS access_hours text,
  ADD COLUMN IF NOT EXISTS invited_by uuid,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  ADD COLUMN IF NOT EXISTS accepted_at timestamptz;

CREATE INDEX IF NOT EXISTS team_invites_email_idx ON public.team_invites (lower(email));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  inv record;
begin
  insert into public.profiles (id, nome, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', new.raw_user_meta_data->>'full_name', ''),
    new.email
  );

  select * into inv
  from public.team_invites
  where lower(email) = lower(new.email)
    and status = 'pendente'
    and expires_at > now()
  order by created_at desc
  limit 1;

  if inv.id is not null then
    insert into public.organization_members (organization_id, user_id, role, permissions)
    values (
      inv.organization_id,
      new.id,
      inv.role,
      jsonb_build_object(
        'permission', inv.role,
        'departments', inv.departments,
        'access_hours', inv.access_hours
      )
    )
    on conflict do nothing;

    update public.team_invites
      set status = 'aceito', accepted_at = now()
      where id = inv.id;
  end if;

  return new;
end;
$function$;