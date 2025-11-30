import { createFileRoute } from '@tanstack/react-router'
import React from 'react'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const [events, setEvents] = React.useState<Record<string, any[]>>({})
  React.useEffect(() => {
    fetch('/api/runningEvents')
      .then((res) => res.json())
      .then((data) => setEvents(data))
  }, [])

  return (
    <div className="p-2">
      <div className="mt-4">Eventos: {JSON.stringify(events)}
      </div>
    </div>
  )
}
