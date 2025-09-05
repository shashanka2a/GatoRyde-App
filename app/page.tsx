import { redirect } from 'next/navigation'

export default function HomePage() {
  // Redirect to Find Ride as the default home page
  redirect('/rides')
}