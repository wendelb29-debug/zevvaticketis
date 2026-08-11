import { createFileRoute } from "@tanstack/react-router";
import { EmailManagementDashboard } from "@/components/admin/email/EmailManagementDashboard";

export const Route = createFileRoute("/admin/email-management/")({
  component: EmailManagementDashboard,
});
