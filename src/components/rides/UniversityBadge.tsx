import { getUniversityInfo } from '@/lib/auth/university-detector'
import { Badge } from '@/src/components/ui/badge'

interface UniversityBadgeProps {
  driverEmail?: string
  className?: string
}

// University color schemes for Florida schools
const UNIVERSITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'ufl.edu': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  'fsu.edu': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  'ucf.edu': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  'usf.edu': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  'fiu.edu': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  'miami.edu': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
}

const DEFAULT_COLORS = { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' }

export function UniversityBadge({ driverEmail, className = '' }: UniversityBadgeProps) {
  if (!driverEmail) {
    return null
  }

  const universityInfo = getUniversityInfo(driverEmail)
  if (!universityInfo) {
    return null
  }

  const domain = driverEmail.toLowerCase().split('@')[1]
  const colors = UNIVERSITY_COLORS[domain] || DEFAULT_COLORS

  // Get university abbreviation
  const getAbbreviation = (name: string): string => {
    if (name.includes('University of Florida')) return 'UF'
    if (name.includes('Florida State')) return 'FSU'
    if (name.includes('University of Central Florida')) return 'UCF'
    if (name.includes('University of South Florida')) return 'USF'
    if (name.includes('Florida International')) return 'FIU'
    if (name.includes('University of Miami')) return 'UM'
    if (name.includes('Florida Atlantic')) return 'FAU'
    if (name.includes('Florida Institute of Technology')) return 'FIT'
    if (name.includes('Nova Southeastern')) return 'NSU'
    if (name.includes('Stetson')) return 'Stetson'
    
    // Fallback: use first letters of major words
    return name
      .split(' ')
      .filter(word => word.length > 2 && !['of', 'the', 'and'].includes(word.toLowerCase()))
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 3)
  }

  const abbreviation = getAbbreviation(universityInfo.name)

  return (
    <Badge 
      variant="outline" 
      className={`${colors.bg} ${colors.text} ${colors.border} font-semibold text-xs px-2 py-1 ${className}`}
      title={universityInfo.name}
    >
      🎓 {abbreviation}
    </Badge>
  )
}

export function getUniversityAbbreviation(universityName: string): string {
  if (universityName.includes('University of Florida')) return 'UF'
  if (universityName.includes('Florida State')) return 'FSU'
  if (universityName.includes('University of Central Florida')) return 'UCF'
  if (universityName.includes('University of South Florida')) return 'USF'
  if (universityName.includes('Florida International')) return 'FIU'
  if (universityName.includes('University of Miami')) return 'UM'
  if (universityName.includes('Florida Atlantic')) return 'FAU'
  if (universityName.includes('Florida Institute of Technology')) return 'FIT'
  if (universityName.includes('Nova Southeastern')) return 'NSU'
  if (universityName.includes('Stetson')) return 'Stetson'
  
  return universityName
    .split(' ')
    .filter(word => word.length > 2 && !['of', 'the', 'and'].includes(word.toLowerCase()))
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 3)
}