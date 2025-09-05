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

export class KYCStorageManager {
  private static readonly BUCKET_NAME = 'kyc-documents'
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  private static readonly ALLOWED_TYPES = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'application/pdf'
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
        message: 'File must be an image (JPEG, PNG, WebP) or PDF'
      }
    }

    return null
  }

  static async uploadFile(
    file: File, 
    userId: string, 
    category: 'license' | 'vehicle' | 'student',
    fieldName: string
  ): Promise<FileUploadResult> {
    // Validate file
    const validationError = this.validateFile(file, fieldName)
    if (validationError) {
      throw new Error(validationError.message)
    }

    // Generate unique file path
    const fileExtension = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExtension}`
    const filePath = `${userId}/${category}/${fileName}`

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

  static async uploadMultipleFiles(
    files: { file: File; category: 'license' | 'vehicle' | 'student'; fieldName: string }[],
    userId: string
  ): Promise<Record<string, FileUploadResult>> {
    const results: Record<string, FileUploadResult> = {}
    const errors: string[] = []

    for (const { file, category, fieldName } of files) {
      try {
        results[fieldName] = await this.uploadFile(file, userId, category, fieldName)
      } catch (error) {
        errors.push(`${fieldName}: ${error instanceof Error ? error.message : 'Upload failed'}`)
      }
    }

    if (errors.length > 0) {
      throw new Error(`Upload errors: ${errors.join('; ')}`)
    }

    return results
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

  static async deleteMultipleFiles(filePaths: string[]): Promise<void> {
    if (filePaths.length === 0) return

    try {
      const { error } = await supabaseAdmin.storage
        .from(this.BUCKET_NAME)
        .remove(filePaths)

      if (error) {
        console.error('Multiple file deletion error:', error)
      }
    } catch (error) {
      console.error('Multiple file deletion error:', error)
    }
  }

  static getFileUrl(filePath: string): string {
    const { data } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(filePath)
    
    return data.publicUrl
  }
}