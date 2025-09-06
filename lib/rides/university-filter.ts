import { getUniversityInfo } from '@/lib/auth/university-detector'
import type { UniversityScope } from './types'

// Florida universities for filtering
export const FLORIDA_UNIVERSITIES = [
  'ufl.edu',      // University of Florida
  'fsu.edu',      // Florida State University  
  'ucf.edu',      // University of Central Florida
  'fiu.edu',      // Florida International University
  'usf.edu',      // University of South Florida
  'miami.edu',    // University of Miami
  'fau.edu',      // Florida Atlantic University
  'fit.edu',      // Florida Institute of Technology
  'nova.edu',     // Nova Southeastern University
  'stetson.edu',  // Stetson University
]

/**
 * Gets the user's university domain from their email
 */
export function getUserUniversityDomain(email: string): string | null {
  if (!email || !email.includes('@')) {
    return null
  }
  
  const domain = email.toLowerCase().split('@')[1]
  return domain?.endsWith('.edu') ? domain : null
}

/**
 * Checks if a university domain is a Florida school
 */
export function isFloridaUniversity(domain: string): boolean {
  return FLORIDA_UNIVERSITIES.includes(domain.toLowerCase())
}

/**
 * Gets the appropriate university filter for database queries
 */
export function getUniversityFilter(
  userEmail: string, 
  scope: UniversityScope
): { domains?: string[], states?: string[] } | null {
  const userDomain = getUserUniversityDomain(userEmail)
  
  switch (scope) {
    case 'my_university':
      // Only show rides from the same university
      return userDomain ? { domains: [userDomain] } : null
      
    case 'florida_schools':
      // Show rides from all Florida universities
      return { domains: FLORIDA_UNIVERSITIES }
      
    case 'all':
      // No university filtering
      return null
      
    default:
      // Default to Florida schools for safety
      return { domains: FLORIDA_UNIVERSITIES }
  }
}

/**
 * Gets a user-friendly description of the current filter scope
 */
export function getFilterScopeDescription(
  userEmail: string,
  scope: UniversityScope
): string {
  const userDomain = getUserUniversityDomain(userEmail)
  const userUniversity = userDomain ? getUniversityInfo(userEmail) : null
  
  switch (scope) {
    case 'my_university':
      return userUniversity 
        ? `${userUniversity.name} students only`
        : 'Your university only'
        
    case 'florida_schools':
      return 'Florida universities (UF, UCF, USF, FIU, FSU, etc.)'
      
    case 'all':
      return 'All universities nationwide'
      
    default:
      return 'Florida universities'
  }
}

/**
 * Determines the default scope based on user's university
 */
export function getDefaultUniversityScope(userEmail: string): UniversityScope {
  const userDomain = getUserUniversityDomain(userEmail)
  
  // If user is from a Florida university, default to Florida schools
  if (userDomain && isFloridaUniversity(userDomain)) {
    return 'florida_schools'
  }
  
  // For non-Florida users, default to their university only
  return userDomain ? 'my_university' : 'all'
}

/**
 * Gets university scope options available to the user
 */
export function getAvailableScopeOptions(userEmail: string): Array<{
  value: UniversityScope
  label: string
  description: string
}> {
  const userDomain = getUserUniversityDomain(userEmail)
  const userUniversity = userDomain ? getUniversityInfo(userEmail) : null
  const isFloridaUser = userDomain ? isFloridaUniversity(userDomain) : false
  
  const options = []
  
  // My University option (if user has a verified .edu email)
  if (userUniversity) {
    options.push({
      value: 'my_university' as UniversityScope,
      label: 'My University',
      description: `${userUniversity.name} students only`
    })
  }
  
  // Florida Schools option (always available, but highlighted for Florida users)
  options.push({
    value: 'florida_schools' as UniversityScope,
    label: isFloridaUser ? 'Florida Schools' : 'Florida Universities',
    description: 'UF, UCF, USF, FIU, FSU, and other Florida schools'
  })
  
  // All Universities option
  options.push({
    value: 'all' as UniversityScope,
    label: 'All Universities',
    description: 'Students from any verified university'
  })
  
  return options
}