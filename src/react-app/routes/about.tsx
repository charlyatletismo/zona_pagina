import { createFileRoute } from '@tanstack/react-router'
import unprotectedCheck from '@/lib/beforeLoadGenericCheck'


export const Route = createFileRoute('/about')({
  component: About,
  beforeLoad: unprotectedCheck(),
})


function About() {
  return <div className="p-2">Hello from About!</div>
}
