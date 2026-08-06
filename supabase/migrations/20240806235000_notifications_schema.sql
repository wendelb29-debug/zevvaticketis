-- Enum for notification types
create type public.notification_category as enum ('sistema', 'vendas', 'atendimento', 'marketing');

-- Notifications table
create table public.notifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    project_id uuid, -- Optional, for project-specific alerts
    category public.notification_category not null default 'sistema',
    title text not null,
    message text not null,
    link text,
    read boolean not null default false,
    created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.notifications to authenticated;
grant all on public.notifications to service_role;

alter table public.notifications enable row level security;

create policy "Users can view their own notifications"
on public.notifications for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can update their own notifications"
on public.notifications for update
to authenticated
using (auth.uid() = user_id);

-- Push Campaigns
create table public.push_campaigns (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    message text not null,
    image_url text,
    action_label text,
    action_link text,
    segment_id uuid, -- link to segments if any
    status text not null default 'draft', -- draft, scheduled, sent, failed
    scheduled_for timestamptz,
    sent_count integer default 0,
    delivered_count integer default 0,
    click_count integer default 0,
    created_at timestamptz not null default now(),
    created_by uuid references auth.users(id)
);

grant select, insert, update, delete on public.push_campaigns to authenticated;
grant all on public.push_campaigns to service_role;

alter table public.push_campaigns enable row level security;

create policy "Admins can manage campaigns"
on public.push_campaigns for all
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Notification Preferences
create table public.notification_preferences (
    user_id uuid primary key references auth.users(id) on delete cascade,
    sales_alerts boolean not null default true,
    messages_alerts boolean not null default true,
    marketing_alerts boolean not null default true,
    system_alerts boolean not null default true,
    updated_at timestamptz not null default now()
);

grant select, insert, update on public.notification_preferences to authenticated;
grant all on public.notification_preferences to service_role;

alter table public.notification_preferences enable row level security;

create policy "Users can manage their own preferences"
on public.notification_preferences for all
to authenticated
using (auth.uid() = user_id);
