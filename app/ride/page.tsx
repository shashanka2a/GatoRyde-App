import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Find Rides - Rydify',
  description: 'Find safe, verified rides with fellow university students',
}

export default function RidePage() {
  // Redirect to the consolidated /rides page
  redirect('/rides')
}