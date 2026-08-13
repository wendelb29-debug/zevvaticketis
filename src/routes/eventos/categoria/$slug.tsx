import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/eventos/categoria/$slug')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/eventos/categoria/$slug"!</div>
}
