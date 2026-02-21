import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/sportingEvents/$eventId/editPhotoAndGallery',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/sportingEvents/$eventId/editPhotoAndGallery"!</div>
}
