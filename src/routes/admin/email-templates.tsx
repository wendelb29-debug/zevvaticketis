import { createFileRoute } from "@tanstack/react-router";
import { EmailTemplatesList } from "@/components/admin/email/EmailTemplatesList";

export const Route = createFileRoute("/admin/email-templates")({
  component: EmailTemplatesList,
});
