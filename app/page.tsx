import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Rydify - Safe University Ridesharing',
  description: 'Connect with verified university students for safe, affordable rides.',
}

export default function HomePage() {
  // Redirect users to /rides by default since landing page is hosted elsewhere
  redirect('/rides')
}