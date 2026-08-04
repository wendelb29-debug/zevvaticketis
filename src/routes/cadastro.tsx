import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useUI } from '@/hooks/use-ui';

export const Route = createFileRoute('/cadastro')({
  component: RegistrationPage,
});

function RegistrationPage() {
  const navigate = useNavigate();
  const { openOverlay } = useUI();

  useEffect(() => {
    openOverlay('auth', 'register');
    navigate({ to: '/' });
  }, [openOverlay, navigate]);

  return null;
}
