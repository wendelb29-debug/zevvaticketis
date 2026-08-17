import { createFileRoute } from '@tanstack/react-router';
import { EmailTemplatesPreview } from '@/components/admin/emails/EmailTemplatesPreview';

export const Route = createFileRoute('/admin/emails/templates')({
  component: EmailTemplatesPreview,
});

