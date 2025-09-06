import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Browse Available Rides - Rydify',
  description: 'Browse available rides from verified university students. Safe, affordable transportation.',
}

export default function BrowseRidesPage() {
  // Redirect to the consolidated /rides page
  redirect('/rides')
}