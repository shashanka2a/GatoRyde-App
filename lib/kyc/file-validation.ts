/**
 * File upload validation utilities for KYC documents and QR codes
 */

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
   * Validate QR code content
   */
  static async validateQRContent(file: File): Promise<{ valid: boolean; errors: string[]; qrData?: string }> {
    // In a real implementation, this would use a QR code library like jsQR
    // For now, we'll simulate QR validation
    
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