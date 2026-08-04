-- 1. Confirma o e-mail manualmente, destravando o login
update auth.users
set email_confirmed_at = now()
where email = 'wendelb29@gmail.com';

-- 2. Promove a Admin da Plataforma (acesso a todas as organizações)
insert into platform_admins (user_id)
select id from auth.users where email = 'wendelb29@gmail.com'
on conflict (user_id) do nothing;