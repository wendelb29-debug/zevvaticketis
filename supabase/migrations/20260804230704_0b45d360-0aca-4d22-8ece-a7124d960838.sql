UPDATE auth.users 
SET email_confirmed_at = now(), 
    updated_at = now()
WHERE email = 'wendelb29@gmail.com';