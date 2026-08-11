import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/checkin/scanner')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/checkin/scanner"!</div>
}
