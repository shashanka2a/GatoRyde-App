import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals'
import { KYCStorageManager } from '../../lib/storage/kyc-storage'

// Mock Supabase
const mockUpload = jest.fn()
const mockGetPublicUrl = jest.fn()
const mockRemove = jest.fn()

jest.mock('../../lib/storage/client', () => ({
  supabase: {
    storage: {
      from: jest.fn(() => ({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      })),
    },
  },
  supabaseAdmin: {
    storage: {
      from: jest.fn(() => ({
        remove: mockRemove,
      })),
    },
  },
}))

describe('KYCStorageManager', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('File Validation', () => {
    it('should validate file size correctly', () => {
      // Create a mock file that's too large (11MB)
      const largeFile = new File([''], 'test.jpg', { 
        type: 'image/jpeg',
      })
      Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 })

      const error = KYCStorageManager.validateFile(largeFile, 'testField')
      
      expect(error).toEqual({
        field: 'testField',
        message: 'File size must be less than 10MB'
      })
    })

    it('should validate file type correctly', () => {
      const invalidFile = new File([''], 'test.txt', { 
        type: 'text/plain',
      })
      Object.defineProperty(invalidFile, 'size', { value: 1024 })

      const error = KYCStorageManager.validateFile(invalidFile, 'testField')
      
      expect(error).toEqual({
        field: 'testField',
        message: 'File must be an image (JPEG, PNG, WebP) or PDF'
      })
    })

    it('should pass validation for valid files', () => {
      const validFile = new File([''], 'test.jpg', { 
        type: 'image/jpeg',
      })
      Object.defineProperty(validFile, 'size', { value: 1024 * 1024 }) // 1MB

      const error = KYCStorageManager.validateFile(validFile, 'testField')
      
      expect(error).toBeNull()
    })

    it('should accept all allowed file types', () => {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
      
      allowedTypes.forEach(type => {
        const file = new File([''], `test.${type.split('/')[1]}`, { type })
        Object.defineProperty(file, 'size', { value: 1024 })
        
        const error = KYCStorageManager.validateFile(file, 'testField')
        expect(error).toBeNull()
      })
    })
  })

  describe('File Upload', () => {
    it('should upload file successfully', async () => {
      const mockFile = new File(['test content'], 'test.jpg', { 
        type: 'image/jpeg',
      })
      Object.defineProperty(mockFile, 'size', { value: 1024 })

      mockUpload.mockResolvedValue({
        data: { path: 'user123/license/test-uuid.jpg' },
        error: null
      })

      mockGetPublicUrl.mockReturnValue({
        data: { publicUrl: 'https://example.com/test-uuid.jpg' }
      })

      const result = await KYCStorageManager.uploadFile(
        mockFile, 
        'user123', 
        'license', 
        'licensePhoto'
      )

      expect(result).toEqual({
        url: 'https://example.com/test-uuid.jpg',
        path: expect.stringMatching(/^user123\/license\/.*\.jpg$/),
        size: 1024,
        type: 'image/jpeg'
      })

      expect(mockUpload).toHaveBeenCalledWith(
        expect.stringMatching(/^user123\/license\/.*\.jpg$/),
        mockFile,
        {
          cacheControl: '3600',
          upsert: false
        }
      )
    })

    it('should handle upload errors', async () => {
      const mockFile = new File(['test content'], 'test.jpg', { 
        type: 'image/jpeg',
      })
      Object.defineProperty(mockFile, 'size', { value: 1024 })

      mockUpload.mockResolvedValue({
        data: null,
        error: { message: 'Upload failed' }
      })

      await expect(
        KYCStorageManager.uploadFile(mockFile, 'user123', 'license', 'licensePhoto')
      ).rejects.toThrow('Failed to upload licensePhoto: Upload failed')
    })

    it('should reject invalid files during upload', async () => {
      const invalidFile = new File([''], 'test.txt', { 
        type: 'text/plain',
      })
      Object.defineProperty(invalidFile, 'size', { value: 1024 })

      await expect(
        KYCStorageManager.uploadFile(invalidFile, 'user123', 'license', 'licensePhoto')
      ).rejects.toThrow('File must be an image (JPEG, PNG, WebP) or PDF')
    })
  })

  describe('Multiple File Upload', () => {
    it('should upload multiple files successfully', async () => {
      const file1 = new File(['content1'], 'test1.jpg', { type: 'image/jpeg' })
      const file2 = new File(['content2'], 'test2.png', { type: 'image/png' })
      Object.defineProperty(file1, 'size', { value: 1024 })
      Object.defineProperty(file2, 'size', { value: 2048 })

      mockUpload
        .mockResolvedValueOnce({
          data: { path: 'user123/license/test1-uuid.jpg' },
          error: null
        })
        .mockResolvedValueOnce({
          data: { path: 'user123/license/test2-uuid.png' },
          error: null
        })

      mockGetPublicUrl
        .mockReturnValueOnce({
          data: { publicUrl: 'https://example.com/test1-uuid.jpg' }
        })
        .mockReturnValueOnce({
          data: { publicUrl: 'https://example.com/test2-uuid.png' }
        })

      const files = [
        { file: file1, category: 'license' as const, fieldName: 'licensePhoto' },
        { file: file2, category: 'license' as const, fieldName: 'selfiePhoto' }
      ]

      const results = await KYCStorageManager.uploadMultipleFiles(files, 'user123')

      expect(results).toEqual({
        licensePhoto: {
          url: 'https://example.com/test1-uuid.jpg',
          path: expect.stringMatching(/^user123\/license\/.*\.jpg$/),
          size: 1024,
          type: 'image/jpeg'
        },
        selfiePhoto: {
          url: 'https://example.com/test2-uuid.png',
          path: expect.stringMatching(/^user123\/license\/.*\.png$/),
          size: 2048,
          type: 'image/png'
        }
      })
    })

    it('should handle partial upload failures', async () => {
      const file1 = new File(['content1'], 'test1.jpg', { type: 'image/jpeg' })
      const file2 = new File(['content2'], 'test2.txt', { type: 'text/plain' }) // Invalid type
      Object.defineProperty(file1, 'size', { value: 1024 })
      Object.defineProperty(file2, 'size', { value: 1024 })

      const files = [
        { file: file1, category: 'license' as const, fieldName: 'licensePhoto' },
        { file: file2, category: 'license' as const, fieldName: 'selfiePhoto' }
      ]

      await expect(
        KYCStorageManager.uploadMultipleFiles(files, 'user123')
      ).rejects.toThrow('Upload errors: selfiePhoto: File must be an image (JPEG, PNG, WebP) or PDF')
    })
  })

  describe('File Deletion', () => {
    it('should delete single file successfully', async () => {
      mockRemove.mockResolvedValue({ error: null })

      await expect(
        KYCStorageManager.deleteFile('user123/license/test.jpg')
      ).resolves.not.toThrow()

      expect(mockRemove).toHaveBeenCalledWith(['user123/license/test.jpg'])
    })

    it('should handle deletion errors gracefully', async () => {
      mockRemove.mockResolvedValue({ 
        error: { message: 'File not found' } 
      })

      // Should not throw even if deletion fails
      await expect(
        KYCStorageManager.deleteFile('user123/license/test.jpg')
      ).resolves.not.toThrow()
    })

    it('should delete multiple files successfully', async () => {
      mockRemove.mockResolvedValue({ error: null })

      const filePaths = [
        'user123/license/test1.jpg',
        'user123/license/test2.png'
      ]

      await expect(
        KYCStorageManager.deleteMultipleFiles(filePaths)
      ).resolves.not.toThrow()

      expect(mockRemove).toHaveBeenCalledWith(filePaths)
    })

    it('should handle empty file paths array', async () => {
      await expect(
        KYCStorageManager.deleteMultipleFiles([])
      ).resolves.not.toThrow()

      expect(mockRemove).not.toHaveBeenCalled()
    })
  })

  describe('File URL Generation', () => {
    it('should generate public URL correctly', () => {
      mockGetPublicUrl.mockReturnValue({
        data: { publicUrl: 'https://example.com/test.jpg' }
      })

      const url = KYCStorageManager.getFileUrl('user123/license/test.jpg')

      expect(url).toBe('https://example.com/test.jpg')
      expect(mockGetPublicUrl).toHaveBeenCalledWith('user123/license/test.jpg')
    })
  })
})