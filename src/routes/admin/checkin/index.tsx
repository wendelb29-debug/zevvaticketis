import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/checkin/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/checkin/"!</div>
}
