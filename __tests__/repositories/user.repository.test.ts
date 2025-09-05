import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { UserRepository } from '../../lib/db/repositories/user.repository'
import { prisma } from '../../lib/db/client'

describe('UserRepository', () => {
  let userRepository: UserRepository

  beforeEach(() => {
    userRepository = new UserRepository()
  })

  afterEach(async () => {
    await prisma.user.deleteMany()
  })

  describe('create', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        eduVerified: false,
      }

      const user = await userRepository.create(userData)

      expect(user).toMatchObject({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        eduVerified: false,
        ratingCount: 0,
      })
      expect(user.id).toBeDefined()
      expect(user.createdAt).toBeInstanceOf(Date)
    })

    it('should create a user with minimal data', async () => {
      const userData = {
        email: 'jane@example.com',
      }

      const user = await userRepository.create(userData)

      expect(user).toMatchObject({
        email: 'jane@example.com',
        eduVerified: false,
        ratingCount: 0,
      })
      expect(user.name).toBeNull()
      expect(user.phone).toBeNull()
    })

    it('should throw error for invalid email', async () => {
      const userData = {
        email: 'invalid-email',
      }

      await expect(userRepository.create(userData)).rejects.toThrow()
    })
  })

  describe('findById', () => {
    it('should find user by id', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
      }

      const createdUser = await userRepository.create(userData)
      const foundUser = await userRepository.findById(createdUser.id)

      expect(foundUser).toMatchObject(createdUser)
    })

    it('should return null for non-existent user', async () => {
      const foundUser = await userRepository.findById('non-existent-id')
      expect(foundUser).toBeNull()
    })
  })

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
      }

      const createdUser = await userRepository.create(userData)
      const foundUser = await userRepository.findByEmail('john@example.com')

      expect(foundUser).toMatchObject(createdUser)
    })

    it('should return null for non-existent email', async () => {
      const foundUser = await userRepository.findByEmail('nonexistent@example.com')
      expect(foundUser).toBeNull()
    })
  })

  describe('update', () => {
    it('should update user data', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
      }

      const createdUser = await userRepository.create(userData)
      const updatedUser = await userRepository.update(createdUser.id, {
        name: 'Jane Doe',
        phone: '+1234567890',
      })

      expect(updatedUser).toMatchObject({
        ...createdUser,
        name: 'Jane Doe',
        phone: '+1234567890',
      })
    })
  })

  describe('updateRating', () => {
    it('should update user rating correctly', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
      }

      const createdUser = await userRepository.create(userData)
      
      // First rating
      const updatedUser1 = await userRepository.updateRating(createdUser.id, 5)
      expect(updatedUser1.ratingAvg).toBe(5)
      expect(updatedUser1.ratingCount).toBe(1)

      // Second rating
      const updatedUser2 = await userRepository.updateRating(createdUser.id, 3)
      expect(updatedUser2.ratingAvg).toBe(4) // (5 + 3) / 2
      expect(updatedUser2.ratingCount).toBe(2)
    })
  })

  describe('verifyEducation', () => {
    it('should verify user education', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        eduVerified: false,
      }

      const createdUser = await userRepository.create(userData)
      const verifiedUser = await userRepository.verifyEducation(createdUser.id)

      expect(verifiedUser.eduVerified).toBe(true)
    })
  })

  describe('delete', () => {
    it('should delete user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
      }

      const createdUser = await userRepository.create(userData)
      await userRepository.delete(createdUser.id)

      const foundUser = await userRepository.findById(createdUser.id)
      expect(foundUser).toBeNull()
    })
  })
})