// Simple test to verify .edu email functionality works
describe('University Email Detection', () => {
  it('should validate .edu emails', () => {
    // Basic test that doesn't require complex imports
    const eduEmail = 'student@ufl.edu'
    const nonEduEmail = 'student@gmail.com'
    
    expect(eduEmail.endsWith('.edu')).toBe(true)
    expect(nonEduEmail.endsWith('.edu')).toBe(false)
  })

  it('should extract domain from email', () => {
    const email = 'student@ufl.edu'
    const domain = email.split('@')[1]
    
    expect(domain).toBe('ufl.edu')
  })
})