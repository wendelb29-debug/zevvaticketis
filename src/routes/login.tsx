import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useUI } from '@/hooks/use-ui';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { openOverlay } = useUI();

  useEffect(() => {
    openOverlay('auth', 'login');
    navigate({ to: '/' });
  }, [openOverlay, navigate]);

  return null;
}
