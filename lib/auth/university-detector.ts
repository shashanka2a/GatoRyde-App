interface UniversityInfo {
  name: string
  state: string
  city: string
}

// University database - mapping email domains to university information
// Focus on 10 major colleges in Florida
const UNIVERSITY_DATABASE: Record<string, UniversityInfo> = {
  // Major Florida Universities
  'ufl.edu': {
    name: 'University of Florida',
    state: 'Florida',
    city: 'Gainesville'
  },
  'fsu.edu': {
    name: 'Florida State University',
    state: 'Florida',
    city: 'Tallahassee'
  },
  'ucf.edu': {
    name: 'University of Central Florida',
    state: 'Florida',
    city: 'Orlando'
  },
  'miami.edu': {
    name: 'University of Miami',
    state: 'Florida',
    city: 'Coral Gables'
  },
  'fiu.edu': {
    name: 'Florida International University',
    state: 'Florida',
    city: 'Miami'
  },
  'usf.edu': {
    name: 'University of South Florida',
    state: 'Florida',
    city: 'Tampa'
  },
  'fau.edu': {
    name: 'Florida Atlantic University',
    state: 'Florida',
    city: 'Boca Raton'
  },
  'fit.edu': {
    name: 'Florida Institute of Technology',
    state: 'Florida',
    city: 'Melbourne'
  },
  'nova.edu': {
    name: 'Nova Southeastern University',
    state: 'Florida',
    city: 'Davie'
  },
  'fgcu.edu': {
    name: 'Florida Gulf Coast University',
    state: 'Florida',
    city: 'Fort Myers'
  }
}

/**
 * Checks if an email is from a .edu domain
 */
export function isEduEmail(email: string): boolean {
  return email.toLowerCase().endsWith('.edu')
}

/**
 * Extracts the domain from an email address
 */
export function getEmailDomain(email: string): string {
  return email.toLowerCase().split('@')[1] || ''
}

/**
 * Gets university information from email domain
 */
export function getUniversityInfo(email: string): UniversityInfo | null {
  if (!isEduEmail(email)) {
    return null
  }

  const domain = getEmailDomain(email)
  return UNIVERSITY_DATABASE[domain] || null
}

/**
 * Gets university name from email domain, with fallback
 */
export function getUniversityName(email: string): string | null {
  const info = getUniversityInfo(email)
  if (info) {
    return info.name
  }

  // Fallback: try to generate name from domain
  if (isEduEmail(email)) {
    const domain = getEmailDomain(email)
    const baseDomain = domain.replace('.edu', '')
    
    // Simple heuristic to generate university name
    const words = baseDomain.split(/[.-]/)
    const capitalizedWords = words.map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    
    return `${capitalizedWords.join(' ')} University`
  }

  return null
}

/**
 * Validates that an email is from a supported .edu domain
 */
export function validateEduEmail(email: string): {
  isValid: boolean
  universityInfo: UniversityInfo | null
  error?: string
} {
  if (!email || typeof email !== 'string') {
    return {
      isValid: false,
      universityInfo: null,
      error: 'Email is required'
    }
  }

  const normalizedEmail = email.toLowerCase().trim()

  if (!normalizedEmail.includes('@')) {
    return {
      isValid: false,
      universityInfo: null,
      error: 'Invalid email format'
    }
  }

  if (!isEduEmail(normalizedEmail)) {
    return {
      isValid: false,
      universityInfo: null,
      error: 'Only .edu email addresses are accepted'
    }
  }

  const universityInfo = getUniversityInfo(normalizedEmail)
  
  return {
    isValid: true,
    universityInfo,
    error: undefined
  }
}

export type { UniversityInfo }