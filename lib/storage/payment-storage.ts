import { supabase, supabaseAdmin } from './client'
import { v4 as uuidv4 } from 'uuid'

export interface FileUploadResult {
  url: string
  path: string
  size: number
  type: string
}

export interface FileValidationError {
  field: string
  message: string
}

export class PaymentStorageManager {
  private static readonly BUCKET_NAME = 'payment-qr-codes'
  private static readonly MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
  private static readonly ALLOWED_TYPES = [
    'image/jpeg',
    'image/jpg', 
    'image/png'
  ]

  static validateFile(file: File, fieldName: string): FileValidationError | null {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        field: fieldName,
        message: `File size must be less than ${this.MAX_FILE_SIZE / 1024 / 1024}MB`
      }
    }

    // Check file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return {
        field: fieldName,
        message: 'File must be a PNG or JPEG image'
      }
    }

    return null
  }

  static async uploadQrCode(
    file: File, 
    userId: string, 
    paymentType: 'zelle' | 'cashapp' | 'venmo'
  ): Promise<FileUploadResult> {
    const fieldName = `${paymentType}QrCode`
    
    // Validate file
    const validationError = this.validateFile(file, fieldName)
    if (validationError) {
      throw new Error(validationError.message)
    }

    // Generate unique file path
    const fileExtension = file.name.split('.').pop()
    const fileName = `${paymentType}-${uuidv4()}.${fileExtension}`
    const filePath = `${userId}/qr-codes/${fileName}`

    try {
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Supabase upload error:', error)
        throw new Error(`Failed to upload ${fieldName}: ${error.message}`)
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath)

      return {
        url: urlData.publicUrl,
        path: filePath,
        size: file.size,
        type: file.type
      }
    } catch (error) {
      console.error('File upload error:', error)
      throw new Error(`Failed to upload ${fieldName}. Please try again.`)
    }
  }

  static async uploadProofOfPayment(
    file: File, 
    userId: string, 
    bookingId: string
  ): Promise<FileUploadResult> {
    const fieldName = 'proofOfPayment'
    
    // Validate file
    const validationError = this.validateFile(file, fieldName)
    if (validationError) {
      throw new Error(validationError.message)
    }

    // Generate unique file path
    const fileExtension = file.name.split('.').pop()
    const fileName = `proof-${bookingId}-${uuidv4()}.${fileExtension}`
    const filePath = `${userId}/proof-of-payment/${fileName}`

    try {
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Supabase upload error:', error)
        throw new Error(`Failed to upload ${fieldName}: ${error.message}`)
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath)

      return {
        url: urlData.publicUrl,
        path: filePath,
        size: file.size,
        type: file.type
      }
    } catch (error) {
      console.error('File upload error:', error)
      throw new Error(`Failed to upload ${fieldName}. Please try again.`)
    }
  }

  static async deleteFile(filePath: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin.storage
        .from(this.BUCKET_NAME)
        .remove([filePath])

      if (error) {
        console.error('File deletion error:', error)
        throw new Error(`Failed to delete file: ${error.message}`)
      }
    } catch (error) {
      console.error('File deletion error:', error)
      // Don't throw - file deletion failures shouldn't break the flow
    }
  }

  static getFileUrl(filePath: string): string {
    const { data } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(filePath)
    
    return data.publicUrl
  }
}