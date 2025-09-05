import { describe, it, expect, jest, beforeEach } from '@jest/globals'

// File upload validation utilities
export class FileUploadValidator {
  static readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp'
  ]

  static readonly MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  static readonly MIN_FILE_SIZE = 1024 // 1KB
  static readonly MAX_DIMENSION = 4096 // 4K pixels
  static readonly MIN_DIMENSION = 100 // 100 pixels

  /**
   * Validate file type and basic properties
   */
  static validateFile(file: File): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check file type
    if (!this.ALLOWED_MIME_TYPES.includes(file.type)) {
      errors.push(`Invalid file type. Allowed types: ${this.ALLOWED_MIME_TYPES.join(', ')}`)
    }

    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      errors.push(`File too large. Maximum size: ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`)
    }

    if (file.size < this.MIN_FILE_SIZE) {
      errors.push(`File too small. Minimum size: ${this.MIN_FILE_SIZE / 1024}KB`)
    }

    // Check file name
    if (!file.name || file.name.trim().length === 0) {
      errors.push('File must have a valid name')
    }

    // Check for suspicious file extensions
    const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com']
    const fileName = file.name.toLowerCase()
    if (suspiciousExtensions.some(ext => fileName.includes(ext))) {
      errors.push('File contains suspicious content')
    }

    return { valid: errors.length === 0, errors }
  }

  /**
   * Validate image dimensions and quality
   */
  static async validateImageDimensions(file: File): Promise<{ valid: boolean; errors: string[]; dimensions?: { width: number; height: number } }> {
    return new Promise((resolve) => {
      const errors: string[] = []
      const img = new Image()
      
      img.onload = () => {
        const { width, height } = img
        
        // Check minimum dimensions
        if (width < this.MIN_DIMENSION || height < this.MIN_DIMENSION) {
          errors.push(`Image too small. Minimum dimensions: ${this.MIN_DIMENSION}x${this.MIN_DIMENSION}px`)
        }

        // Check maximum dimensions
        if (width > this.MAX_DIMENSION || height > this.MAX_DIMENSION) {
          errors.push(`Image too large. Maximum dimensions: ${this.MAX_DIMENSION}x${this.MAX_DIMENSION}px`)
        }

        // Check aspect ratio for QR codes (should be roughly square)
        const aspectRatio = width / height
        if (aspectRatio < 0.5 || aspectRatio > 2.0) {
          errors.push('QR code image should be roughly square (aspect ratio between 0.5 and 2.0)')
        }

        resolve({ 
          valid: errors.length === 0, 
          errors,
          dimensions: { width, height }
        })
      }

      img.onerror = () => {
        resolve({ 
          valid: false, 
          errors: ['Invalid image file or corrupted data'] 
        })
      }

      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Validate QR code content (mock implementation)
   */
  static async validateQRContent(file: File): Promise<{ valid: boolean; errors: string[]; qrData?: string }> {
    // In a real implementation, this would use a QR code library like jsQR
    // For testing, we'll simulate QR validation
    
    const mockQRData = await this.mockQRCodeReader(file)
    const errors: string[] = []

    if (!mockQRData) {
      errors.push('No QR code detected in image')
      return { valid: false, errors }
    }

    // Validate QR content format (should be payment-related)
    const paymentPatterns = [
      /^https:\/\/cash\.app\/\$[\w-]+$/i, // Cash App
      /^zelle:\/\/payment\?/i, // Zelle
      /^venmo:\/\/paycharge\?/i, // Venmo
      /^paypal\.me\/[\w-]+$/i, // PayPal
      /^[\w.-]+@[\w.-]+\.[a-z]{2,}$/i, // Email (for Zelle)
      /^\+?1?[2-9]\d{2}[2-9]\d{2}\d{4}$/i, // Phone (for Zelle)
    ]

    const isValidPaymentQR = paymentPatterns.some(pattern => pattern.test(mockQRData))
    
    if (!isValidPaymentQR) {
      errors.push('QR code does not contain valid payment information')
    }

    // Check for suspicious content
    const suspiciousPatterns = [
      /javascript:/i,
      /data:/i,
      /file:/i,
      /<script/i,
      /eval\(/i,
    ]

    if (suspiciousPatterns.some(pattern => pattern.test(mockQRData))) {
      errors.push('QR code contains suspicious or potentially malicious content')
    }

    return { 
      valid: errors.length === 0, 
      errors,
      qrData: mockQRData
    }
  }

  /**
   * Mock QR code reader for testing
   */
  private static async mockQRCodeReader(file: File): Promise<string | null> {
    // Simulate QR reading based on file name for testing
    const fileName = file.name.toLowerCase()
    
    if (fileName.includes('cashapp')) return 'https://cash.app/$testuser'
    if (fileName.includes('zelle')) return 'test@example.com'
    if (fileName.includes('venmo')) return 'venmo://paycharge?txn=pay&recipients=testuser'
    if (fileName.includes('paypal')) return 'paypal.me/testuser'
    if (fileName.includes('invalid')) return 'https://malicious-site.com/steal-data'
    if (fileName.includes('noqr')) return null
    
    // Default valid QR for generic test files
    return 'https://cash.app/$defaultuser'
  }

  /**
   * Comprehensive validation for QR image uploads
   */
  static async validateQRImage(file: File): Promise<{ valid: boolean; errors: string[]; metadata?: any }> {
    const errors: string[] = []
    let metadata: any = {}

    // Basic file validation
    const fileValidation = this.validateFile(file)
    if (!fileValidation.valid) {
      errors.push(...fileValidation.errors)
    }

    // Image dimension validation
    try {
      const dimensionValidation = await this.validateImageDimensions(file)
      if (!dimensionValidation.valid) {
        errors.push(...dimensionValidation.errors)
      } else {
        metadata.dimensions = dimensionValidation.dimensions
      }
    } catch (error) {
      errors.push('Failed to validate image dimensions')
    }

    // QR content validation (only if basic validations pass)
    if (errors.length === 0) {
      try {
        const qrValidation = await this.validateQRContent(file)
        if (!qrValidation.valid) {
          errors.push(...qrValidation.errors)
        } else {
          metadata.qrData = qrValidation.qrData
        }
      } catch (error) {
        errors.push('Failed to read QR code content')
      }
    }

    return { 
      valid: errors.length === 0, 
      errors,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined
    }
  }
}

// Mock File constructor for testing
class MockFile {
  name: string
  size: number
  type: string
  lastModified: number

  constructor(content: string[], name: string, options: { type?: string; lastModified?: number } = {}) {
    this.name = name
    this.size = content.join('').length
    this.type = options.type || 'application/octet-stream'
    this.lastModified = options.lastModified || Date.now()
  }
}

// Mock Image for testing
global.Image = class {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  width = 0
  height = 0
  
  set src(value: string) {
    setTimeout(() => {
      // Simulate different image sizes based on filename
      if (value.includes('small')) {
        this.width = 50
        this.height = 50
      } else if (value.includes('large')) {
        this.width = 5000
        this.height = 5000
      } else if (value.includes('wide')) {
        this.width = 1000
        this.height = 200
      } else if (value.includes('corrupt')) {
        this.onerror?.()
        return
      } else {
        this.width = 800
        this.height = 800
      }
      this.onload?.()
    }, 10)
  }
} as any

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn((file: any) => `blob:${file.name}`)

describe('FileUploadValidator', () => {
  describe('validateFile', () => {
    it('should accept valid image files', () => {
      const file = new MockFile(['fake image data'], 'qr-code.jpg', { type: 'image/jpeg' }) as any
      const result = FileUploadValidator.validateFile(file)
      
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should reject invalid file types', () => {
      const file = new MockFile(['fake data'], 'document.pdf', { type: 'application/pdf' }) as any
      const result = FileUploadValidator.validateFile(file)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Invalid file type. Allowed types: image/jpeg, image/jpg, image/png, image/webp')
    })

    it('should reject files that are too large', () => {
      const file = new MockFile(['.'.repeat(11 * 1024 * 1024)], 'huge.jpg', { type: 'image/jpeg' }) as any
      const result = FileUploadValidator.validateFile(file)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('File too large. Maximum size: 10MB')
    })

    it('should reject files that are too small', () => {
      const file = new MockFile(['tiny'], 'tiny.jpg', { type: 'image/jpeg' }) as any
      const result = FileUploadValidator.validateFile(file)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('File too small. Minimum size: 1KB')
    })

    it('should reject files with suspicious extensions', () => {
      const file = new MockFile(['fake data'], 'malware.exe.jpg', { type: 'image/jpeg' }) as any
      const result = FileUploadValidator.validateFile(file)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('File contains suspicious content')
    })

    it('should reject files without names', () => {
      const file = new MockFile(['fake data'], '', { type: 'image/jpeg' }) as any
      const result = FileUploadValidator.validateFile(file)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('File must have a valid name')
    })
  })

  describe('validateImageDimensions', () => {
    it('should accept images with valid dimensions', async () => {
      const file = new MockFile(['fake data'], 'normal.jpg', { type: 'image/jpeg' }) as any
      const result = await FileUploadValidator.validateImageDimensions(file)
      
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
      expect(result.dimensions).toEqual({ width: 800, height: 800 })
    })

    it('should reject images that are too small', async () => {
      const file = new MockFile(['fake data'], 'small.jpg', { type: 'image/jpeg' }) as any
      const result = await FileUploadValidator.validateImageDimensions(file)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Image too small. Minimum dimensions: 100x100px')
    })

    it('should reject images that are too large', async () => {
      const file = new MockFile(['fake data'], 'large.jpg', { type: 'image/jpeg' }) as any
      const result = await FileUploadValidator.validateImageDimensions(file)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Image too large. Maximum dimensions: 4096x4096px')
    })

    it('should reject images with bad aspect ratios', async () => {
      const file = new MockFile(['fake data'], 'wide.jpg', { type: 'image/jpeg' }) as any
      const result = await FileUploadValidator.validateImageDimensions(file)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('QR code image should be roughly square (aspect ratio between 0.5 and 2.0)')
    })

    it('should handle corrupted images', async () => {
      const file = new MockFile(['fake data'], 'corrupt.jpg', { type: 'image/jpeg' }) as any
      const result = await FileUploadValidator.validateImageDimensions(file)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Invalid image file or corrupted data')
    })
  })

  describe('validateQRContent', () => {
    it('should accept valid Cash App QR codes', async () => {
      const file = new MockFile(['fake data'], 'cashapp-qr.jpg', { type: 'image/jpeg' }) as any
      const result = await FileUploadValidator.validateQRContent(file)
      
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
      expect(result.qrData).toBe('https://cash.app/$testuser')
    })

    it('should accept valid Zelle QR codes', async () => {
      const file = new MockFile(['fake data'], 'zelle-qr.jpg', { type: 'image/jpeg' }) as any
      const result = await FileUploadValidator.validateQRContent(file)
      
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
      expect(result.qrData).toBe('test@example.com')
    })

    it('should reject images without QR codes', async () => {
      const file = new MockFile(['fake data'], 'noqr-image.jpg', { type: 'image/jpeg' }) as any
      const result = await FileUploadValidator.validateQRContent(file)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('No QR code detected in image')
    })

    it('should reject QR codes with invalid payment data', async () => {
      const file = new MockFile(['fake data'], 'invalid-qr.jpg', { type: 'image/jpeg' }) as any
      const result = await FileUploadValidator.validateQRContent(file)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('QR code contains suspicious or potentially malicious content')
    })

    it('should reject QR codes with non-payment content', async () => {
      const file = new MockFile(['fake data'], 'random-qr.jpg', { type: 'image/jpeg' }) as any
      // Mock a QR that contains non-payment data
      jest.spyOn(FileUploadValidator as any, 'mockQRCodeReader').mockResolvedValue('https://example.com/not-payment')
      
      const result = await FileUploadValidator.validateQRContent(file)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('QR code does not contain valid payment information')
    })
  })

  describe('validateQRImage (comprehensive)', () => {
    it('should pass comprehensive validation for valid QR image', async () => {
      const file = new MockFile(['.'.repeat(5000)], 'cashapp-qr.jpg', { type: 'image/jpeg' }) as any
      const result = await FileUploadValidator.validateQRImage(file)
      
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
      expect(result.metadata?.dimensions).toEqual({ width: 800, height: 800 })
      expect(result.metadata?.qrData).toBe('https://cash.app/$testuser')
    })

    it('should fail comprehensive validation for invalid file type', async () => {
      const file = new MockFile(['.'.repeat(5000)], 'qr-code.pdf', { type: 'application/pdf' }) as any
      const result = await FileUploadValidator.validateQRImage(file)
      
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toContain('Invalid file type')
    })

    it('should fail comprehensive validation for small image', async () => {
      const file = new MockFile(['.'.repeat(5000)], 'small-qr.jpg', { type: 'image/jpeg' }) as any
      const result = await FileUploadValidator.validateQRImage(file)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Image too small. Minimum dimensions: 100x100px')
    })

    it('should accumulate multiple validation errors', async () => {
      const file = new MockFile(['tiny'], 'small-invalid.pdf', { type: 'application/pdf' }) as any
      const result = await FileUploadValidator.validateQRImage(file)
      
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
      expect(result.errors).toContain('Invalid file type. Allowed types: image/jpeg, image/jpg, image/png, image/webp')
      expect(result.errors).toContain('File too small. Minimum size: 1KB')
    })

    it('should handle validation errors gracefully', async () => {
      const file = new MockFile(['.'.repeat(5000)], 'corrupt-qr.jpg', { type: 'image/jpeg' }) as any
      const result = await FileUploadValidator.validateQRImage(file)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Invalid image file or corrupted data')
    })
  })

  describe('edge cases', () => {
    it('should handle all supported image formats', () => {
      const formats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      
      formats.forEach(format => {
        const file = new MockFile(['.'.repeat(5000)], `test.${format.split('/')[1]}`, { type: format }) as any
        const result = FileUploadValidator.validateFile(file)
        expect(result.valid).toBe(true)
      })
    })

    it('should handle boundary file sizes', () => {
      // Exactly at minimum size
      const minFile = new MockFile(['.'.repeat(1024)], 'min.jpg', { type: 'image/jpeg' }) as any
      expect(FileUploadValidator.validateFile(minFile).valid).toBe(true)
      
      // Exactly at maximum size
      const maxFile = new MockFile(['.'.repeat(10 * 1024 * 1024)], 'max.jpg', { type: 'image/jpeg' }) as any
      expect(FileUploadValidator.validateFile(maxFile).valid).toBe(true)
    })

    it('should handle various suspicious file patterns', () => {
      const suspiciousNames = [
        'image.exe.jpg',
        'qr.bat.png',
        'payment.cmd.webp',
        'code.scr.jpeg'
      ]
      
      suspiciousNames.forEach(name => {
        const file = new MockFile(['.'.repeat(5000)], name, { type: 'image/jpeg' }) as any
        const result = FileUploadValidator.validateFile(file)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('File contains suspicious content')
      })
    })
  })
})